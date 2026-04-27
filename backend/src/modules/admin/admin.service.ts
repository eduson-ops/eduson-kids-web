import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Classroom } from '../classroom/classroom.entity';
import { TenantContext } from '../../common/tenancy/tenant.context';
import { AuditService } from '../audit/audit.service';

/**
 * Admin operations service. Backed by an explicit role-permission matrix
 * — different admin roles see different scopes:
 *
 *   PLATFORM_ADMIN  — global (all tenants), can edit anything
 *   REGIONAL_ADMIN  — limited to children tenants of their tenant
 *   SCHOOL_ADMIN    — limited to their tenant
 *   CURATOR         — read-only on their tenant
 *   METHODIST       — limited to AI-content endpoints (NOT this service)
 *   TEACHER         — non-admin
 *
 * Read operations enforce tenant scope by querying with `tenantId` filter.
 * Write operations additionally check role permissions and emit an
 * audit_logs entry (action prefix `admin.user.*`).
 *
 * Audit context (ip, userAgent) is passed in from the controller because
 * AdminService is stateless and the request scope ends before fire-and-
 * forget audit writes complete.
 */
export interface AdminAuditContext {
  ip: string;
  userAgent: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Classroom) private readonly classrooms: Repository<Classroom>,
    private readonly tenantContext: TenantContext,
    private readonly auditService: AuditService,
  ) {}

  /** All users in the active tenant, optional role filter, paginated.
   *  NOT audited — read operation, too noisy for the audit log. */
  async listUsers(opts: {
    role?: UserRole;
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}): Promise<{ items: User[]; total: number }> {
    const ctx = this.tenantContext.require();
    const page = opts.page ?? 1;
    const pageSize = Math.min(opts.pageSize ?? 50, 200);

    const qb = this.users
      .createQueryBuilder('u')
      .where('u.tenant_id = :tenantId', { tenantId: ctx.tenantId });
    if (opts.role) qb.andWhere('u.role = :role', { role: opts.role });
    if (opts.search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2.where('u.login ILIKE :s', { s: `%${opts.search}%` });
        }),
      );
    }
    qb.orderBy('u.created_at', 'DESC').skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /**
   * Activate / deactivate a user. SCHOOL_ADMIN+ only.
   * Cannot deactivate yourself or someone with higher role.
   * Audited as `admin.user.set_active`.
   */
  async setUserActive(
    actor: { sub: string; role: string },
    userId: string,
    isActive: boolean,
    auditCtx: AdminAuditContext,
  ): Promise<User> {
    const ctx = this.tenantContext.require();
    if (actor.sub === userId) throw new ForbiddenException('Cannot toggle yourself');

    const target = await this.users.findOne({ where: { id: userId, tenantId: ctx.tenantId } });
    if (!target) throw new NotFoundException('User not found');

    const actorRank = ROLE_RANK[actor.role as UserRole] ?? 0;
    const targetRank = ROLE_RANK[target.role] ?? 0;
    if (targetRank >= actorRank) {
      throw new ForbiddenException('Cannot modify user with equal or higher role');
    }

    const oldActive = target.isActive;
    target.isActive = isActive;
    const saved = await this.users.save(target);

    // Audit (fire-and-forget — must not block the response or fail the action).
    void this.auditService
      .log({
        userId: actor.sub,
        action: 'admin.user.set_active',
        resourceType: 'user',
        resourceId: userId,
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
        payload: { oldIsActive: oldActive, newIsActive: isActive },
      })
      .catch((err) => this.logger.warn(`audit log failed: ${(err as Error).message}`));

    return saved;
  }

  /**
   * Change a user's role. PLATFORM_ADMIN only.
   * Audited as `admin.user.set_role`.
   */
  async setUserRole(
    actor: { sub: string; role: string },
    userId: string,
    newRole: UserRole,
    auditCtx: AdminAuditContext,
  ): Promise<User> {
    if (actor.role !== UserRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Only PLATFORM_ADMIN can change roles');
    }
    if (actor.sub === userId) throw new ForbiddenException('Cannot change own role');

    const ctx = this.tenantContext.require();
    const target = await this.users.findOne({ where: { id: userId, tenantId: ctx.tenantId } });
    if (!target) throw new NotFoundException('User not found');

    const oldRole = target.role;
    target.role = newRole;
    const saved = await this.users.save(target);

    void this.auditService
      .log({
        userId: actor.sub,
        action: 'admin.user.set_role',
        resourceType: 'user',
        resourceId: userId,
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
        payload: { oldRole, newRole },
      })
      .catch((err) => this.logger.warn(`audit log failed: ${(err as Error).message}`));

    return saved;
  }

  /**
   * Tenant-wide statistics. CURATOR+ can read.
   * NOT audited — read operation.
   */
  async getTenantStats(): Promise<{
    activeUsers: number;
    classrooms: number;
    childrenAwaitingConsent: number;
    usersByRole: Record<string, number>;
  }> {
    const ctx = this.tenantContext.require();

    const totalActive = await this.users.count({
      where: { tenantId: ctx.tenantId, isActive: true },
    });
    const classrooms = await this.classrooms.count({
      where: { tenantId: ctx.tenantId, isArchived: false },
    });
    const awaitingConsent = await this.users
      .createQueryBuilder('u')
      .where('u.tenant_id = :tenantId', { tenantId: ctx.tenantId })
      .andWhere('u.role = :role', { role: UserRole.CHILD })
      .andWhere('u.parental_consent_at IS NULL')
      .getCount();

    const byRoleRaw = await this.users
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)::int', 'cnt')
      .where('u.tenant_id = :tenantId', { tenantId: ctx.tenantId })
      .groupBy('u.role')
      .getRawMany<{ role: string; cnt: number }>();

    const usersByRole: Record<string, number> = {};
    for (const r of byRoleRaw) usersByRole[r.role] = r.cnt;

    return { activeUsers: totalActive, classrooms, childrenAwaitingConsent: awaitingConsent, usersByRole };
  }
}

/**
 * Hierarchy used for "cannot affect equal-or-higher role" checks.
 * Higher number = more privileges.
 */
const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.CHILD]: 1,
  [UserRole.PARENT]: 2,
  [UserRole.TEACHER]: 3,
  [UserRole.METHODIST]: 4,
  [UserRole.CURATOR]: 5,
  [UserRole.SCHOOL_ADMIN]: 6,
  [UserRole.REGIONAL_ADMIN]: 7,
  [UserRole.PLATFORM_ADMIN]: 9,
};
