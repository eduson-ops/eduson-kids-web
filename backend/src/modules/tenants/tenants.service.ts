import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus, TenantTier, DEFAULT_TENANT_ID } from './tenant.entity';

export interface CreateTenantDto {
  slug: string;
  name: string;
  tier?: TenantTier;
  customDomain?: string;
  branding?: Record<string, unknown>;
  featureFlags?: Record<string, boolean>;
  quotas?: Record<string, number>;
  parentTenantId?: string;
}

export interface UpdateTenantDto {
  name?: string;
  status?: TenantStatus;
  tier?: TenantTier;
  customDomain?: string | null;
  branding?: Record<string, unknown>;
  featureFlags?: Record<string, boolean>;
  quotas?: Record<string, number>;
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const exists = await this.tenants.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException(`Tenant slug "${dto.slug}" already exists`);
    const t = this.tenants.create({
      slug: dto.slug,
      name: dto.name,
      tier: dto.tier ?? TenantTier.B2C,
      customDomain: dto.customDomain ?? null,
      branding: dto.branding ?? {},
      featureFlags: dto.featureFlags ?? {},
      quotas: dto.quotas ?? defaultQuotas(dto.tier ?? TenantTier.B2C),
      parentTenantId: dto.parentTenantId ?? null,
    });
    return this.tenants.save(t);
  }

  async findById(id: string): Promise<Tenant> {
    const t = await this.tenants.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenants.findOne({ where: { slug } });
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    return this.tenants.findOne({ where: { customDomain: domain } });
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const t = await this.findById(id);
    Object.assign(t, dto);
    return this.tenants.save(t);
  }

  async listChildren(parentId: string): Promise<Tenant[]> {
    return this.tenants.find({ where: { parentTenantId: parentId } });
  }

  async getDefault(): Promise<Tenant> {
    return this.findById(DEFAULT_TENANT_ID);
  }
}

/**
 * Sane default quotas per tier. Can be overridden per-tenant.
 */
export function defaultQuotas(tier: TenantTier): Record<string, number> {
  switch (tier) {
    case TenantTier.PILOT:
      return { maxStudents: 30, maxClasses: 1, maxStorageMb: 100, maxAiLessonsPerMonth: 5 };
    case TenantTier.B2C:
      return { maxStudents: 3, maxClasses: 0, maxStorageMb: 500, maxAiLessonsPerMonth: 0 };
    case TenantTier.SCHOOL:
      return { maxStudents: 500, maxClasses: 30, maxStorageMb: 5000, maxAiLessonsPerMonth: 50 };
    case TenantTier.MUNICIPAL:
      return { maxStudents: 10_000, maxClasses: 600, maxStorageMb: 50_000, maxAiLessonsPerMonth: 500 };
    case TenantTier.REGIONAL:
      return { maxStudents: 100_000, maxClasses: 6_000, maxStorageMb: 500_000, maxAiLessonsPerMonth: 5_000 };
    case TenantTier.WHITELABEL:
      return { maxStudents: 50_000, maxClasses: 3_000, maxStorageMb: 200_000, maxAiLessonsPerMonth: 2_000 };
    case TenantTier.CORE:
    default:
      return { maxStudents: 1_000_000, maxClasses: 1_000_000, maxStorageMb: 10_000_000, maxAiLessonsPerMonth: 1_000_000 };
  }
}
