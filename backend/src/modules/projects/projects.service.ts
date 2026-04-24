import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, Not } from 'typeorm';
import { randomBytes } from 'node:crypto';
import {
  Project,
  ProjectType,
  ProjectVisibility,
} from './project.entity';
import {
  ProjectVersion,
  VersionSource,
} from './project-version.entity';
import { TenantContext } from '../../common/tenancy/tenant.context';
import { TenantsService } from '../tenants/tenants.service';

/**
 * Cloud-save + versioning service.
 *
 * Mechanics:
 * - Every save = new ProjectVersion. Rolling window of MAX_VERSIONS keeps
 *   storage bounded; older versions are pruned.
 * - Ctrl-Z = `restoreToVersion(projectId, sequence)` — creates a NEW version
 *   from the snapshot of the chosen older one. We do NOT roll back history;
 *   we append a `ROLLBACK` source marker so the user can re-undo.
 * - Quotas: per-tenant `maxStorageMb` checked on every save. Per-project hard
 *   cap of MAX_VERSION_SIZE_BYTES rejects single payloads larger than 5 MB
 *   (a typical Studio scene with all 287 props is ~150 KB).
 * - Auto-save throttle is on the client; backend just dedups identical
 *   `contentJson` (compares last version hash) to avoid version-spam.
 */
const MAX_VERSIONS = 20;
const MAX_VERSION_SIZE_BYTES = 5 * 1024 * 1024;

export interface CreateProjectDto {
  name: string;
  type: ProjectType;
  classroomId?: string;
  visibility?: ProjectVisibility;
  initialContent?: Record<string, unknown>;
}

export interface SaveProjectDto {
  contentJson: Record<string, unknown>;
  source?: VersionSource;
  note?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectVersion) private readonly versions: Repository<ProjectVersion>,
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    const ctx = this.tenantContext.require();
    const project = this.projects.create({
      tenantId: ctx.tenantId,
      ownerId,
      classroomId: dto.classroomId ?? null,
      name: dto.name,
      type: dto.type,
      visibility: dto.visibility ?? ProjectVisibility.PRIVATE,
      shareToken: null,
      currentVersionId: null,
      currentSizeBytes: 0,
      stats: {},
      deletedAt: null,
    });
    const saved = await this.projects.save(project);

    if (dto.initialContent) {
      await this.save(saved.id, ownerId, {
        contentJson: dto.initialContent,
        source: VersionSource.MANUAL,
      });
    }

    return this.findById(saved.id, ownerId);
  }

  async findById(projectId: string, requesterId: string): Promise<Project> {
    const ctx = this.tenantContext.require();
    const p = await this.projects.findOne({
      where: { id: projectId, tenantId: ctx.tenantId, deletedAt: IsNull() },
    });
    if (!p) throw new NotFoundException('Project not found');
    if (
      p.ownerId !== requesterId &&
      p.visibility === ProjectVisibility.PRIVATE
    ) {
      throw new ForbiddenException();
    }
    return p;
  }

  async listForOwner(ownerId: string): Promise<Project[]> {
    const ctx = this.tenantContext.require();
    return this.projects.find({
      where: {
        tenantId: ctx.tenantId,
        ownerId,
        deletedAt: IsNull(),
      },
      order: { updatedAt: 'DESC' },
      take: 100,
    });
  }

  async getLatestContent(
    projectId: string,
    requesterId: string,
  ): Promise<{ project: Project; version: ProjectVersion | null }> {
    const project = await this.findById(projectId, requesterId);
    if (!project.currentVersionId) {
      return { project, version: null };
    }
    const version = await this.versions.findOne({
      where: { id: project.currentVersionId, tenantId: project.tenantId },
    });
    return { project, version };
  }

  async listVersions(
    projectId: string,
    requesterId: string,
  ): Promise<Pick<ProjectVersion, 'id' | 'sequence' | 'source' | 'note' | 'sizeBytes' | 'createdAt' | 'createdBy'>[]> {
    const project = await this.findById(projectId, requesterId);
    return this.versions
      .find({
        where: { tenantId: project.tenantId, projectId },
        order: { sequence: 'DESC' },
        take: MAX_VERSIONS,
        select: ['id', 'sequence', 'source', 'note', 'sizeBytes', 'createdAt', 'createdBy'],
      });
  }

  async getVersion(
    projectId: string,
    sequence: number,
    requesterId: string,
  ): Promise<ProjectVersion> {
    const project = await this.findById(projectId, requesterId);
    const v = await this.versions.findOne({
      where: { tenantId: project.tenantId, projectId, sequence },
    });
    if (!v) throw new NotFoundException('Version not found');
    return v;
  }

  /**
   * Save a new version. If the contentJson is identical (by serialized size)
   * to the latest version we skip — typical for autosave when nothing changed.
   */
  async save(
    projectId: string,
    requesterId: string,
    dto: SaveProjectDto,
  ): Promise<ProjectVersion> {
    const ctx = this.tenantContext.require();
    const project = await this.findById(projectId, requesterId);
    if (project.ownerId !== requesterId) throw new ForbiddenException();

    const serialized = JSON.stringify(dto.contentJson);
    const sizeBytes = Buffer.byteLength(serialized, 'utf8');
    if (sizeBytes > MAX_VERSION_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Project version size ${sizeBytes} exceeds limit ${MAX_VERSION_SIZE_BYTES}`,
      );
    }

    // Quota: total storage per tenant
    const tenant = await this.tenantsService.findById(ctx.tenantId);
    const maxStorageMb = tenant.quotas?.maxStorageMb ?? Number.MAX_SAFE_INTEGER;
    const usedBytes = await this.versions
      .createQueryBuilder('v')
      .where('v.tenant_id = :tenantId', { tenantId: ctx.tenantId })
      .select('COALESCE(SUM(v.size_bytes), 0)', 'total')
      .getRawOne<{ total: string }>();
    const usedMb = parseInt(usedBytes?.total ?? '0', 10) / (1024 * 1024);
    if (usedMb + sizeBytes / (1024 * 1024) > maxStorageMb) {
      throw new BadRequestException(
        `Tenant storage quota exceeded: ${usedMb.toFixed(2)} of ${maxStorageMb} MB`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      // Dedup: skip if last version had identical size + same first 256 bytes
      const last = await manager.findOne(ProjectVersion, {
        where: { projectId, tenantId: ctx.tenantId },
        order: { sequence: 'DESC' },
      });
      if (last && last.sizeBytes === sizeBytes) {
        const lastJson = JSON.stringify(last.contentJson);
        if (lastJson === serialized) return last;
      }

      const sequence = (last?.sequence ?? 0) + 1;
      const version = manager.create(ProjectVersion, {
        tenantId: ctx.tenantId,
        projectId,
        sequence,
        contentJson: dto.contentJson,
        sizeBytes,
        source: dto.source ?? VersionSource.AUTOSAVE,
        note: dto.note ?? null,
        createdBy: requesterId,
      });
      const saved = await manager.save(ProjectVersion, version);

      // Update parent project pointer
      await manager.update(Project, project.id, {
        currentVersionId: saved.id,
        currentSizeBytes: sizeBytes,
      });

      // Prune older versions beyond MAX_VERSIONS — keep newest N
      const toPrune = await manager.find(ProjectVersion, {
        where: { tenantId: ctx.tenantId, projectId },
        order: { sequence: 'DESC' },
        skip: MAX_VERSIONS,
      });
      if (toPrune.length > 0) {
        await manager.remove(toPrune);
      }

      return saved;
    });
  }

  /**
   * Restore project to a prior version. Creates a NEW version with the same
   * content as the chosen one, marked as ROLLBACK. This way the rollback is
   * itself versioned and re-undoable (Ctrl-Z of a Ctrl-Z).
   */
  async restoreToVersion(
    projectId: string,
    sequence: number,
    requesterId: string,
  ): Promise<ProjectVersion> {
    const project = await this.findById(projectId, requesterId);
    if (project.ownerId !== requesterId) throw new ForbiddenException();
    const target = await this.getVersion(projectId, sequence, requesterId);
    return this.save(projectId, requesterId, {
      contentJson: target.contentJson,
      source: VersionSource.ROLLBACK,
      note: `Откат на v${sequence}`,
    });
  }

  /**
   * Issue a one-time share token for unlisted access. Token rotates on
   * each call so old links become invalid. Token grants READ access only.
   */
  async issueShareToken(projectId: string, requesterId: string): Promise<string> {
    const project = await this.findById(projectId, requesterId);
    if (project.ownerId !== requesterId) throw new ForbiddenException();
    const token = randomBytes(24).toString('base64url');
    await this.projects.update(projectId, {
      shareToken: token,
      visibility: ProjectVisibility.UNLISTED,
    });
    return token;
  }

  async findByShareToken(token: string): Promise<Project | null> {
    const ctx = this.tenantContext.require();
    return this.projects.findOne({
      where: {
        tenantId: ctx.tenantId,
        shareToken: token,
        visibility: Not(ProjectVisibility.PRIVATE),
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Soft delete with 30-day recovery window. Hard delete via cron job
   * (TODO: implement in scheduled job).
   */
  async softDelete(projectId: string, requesterId: string): Promise<void> {
    const project = await this.findById(projectId, requesterId);
    if (project.ownerId !== requesterId) throw new ForbiddenException();
    await this.projects.update(projectId, { deletedAt: new Date() });
  }

  async restore(projectId: string, requesterId: string): Promise<void> {
    const ctx = this.tenantContext.require();
    const p = await this.projects.findOne({
      where: { id: projectId, tenantId: ctx.tenantId, deletedAt: Not(IsNull()) },
    });
    if (!p) throw new NotFoundException('Project not found in trash');
    if (p.ownerId !== requesterId) throw new ForbiddenException();
    // 30-day window
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    if (p.deletedAt && p.deletedAt < cutoff) {
      throw new ForbiddenException('Recovery window expired');
    }
    await this.projects.update(projectId, { deletedAt: null });
  }
}
