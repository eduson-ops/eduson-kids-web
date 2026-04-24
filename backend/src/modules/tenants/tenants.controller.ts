import { Controller, Get, Post, Patch, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantsService, CreateTenantDto, UpdateTenantDto } from './tenants.service';
import { TenantContext } from '../../common/tenancy/tenant.context';
import { AnonymousAllowed } from '../../common/tenancy/tenant.guard';

/**
 * Tenant management. Restricted to system / super-admin role; ordinary users
 * must not be able to enumerate or modify tenants.
 *
 * GET /tenants/me — public-ish, returns the active tenant's branding so the
 * frontend can theme the UI before login. Allows anonymous so the lobby
 * page can render properly.
 */
@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenants: TenantsService,
    private readonly tenantContext: TenantContext,
  ) {}

  @AnonymousAllowed()
  @Get('me')
  async getMyTenant() {
    const ctx = this.tenantContext.current();
    if (!ctx) return null;
    const tenant = await this.tenants.findById(ctx.tenantId);
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      tier: tenant.tier,
      branding: tenant.branding,
      featureFlags: tenant.featureFlags,
      // Quotas and parent are NOT exposed publicly
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTenantDto) {
    this.requireSystemBypass();
    return this.tenants.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    this.requireSystemBypass();
    return this.tenants.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/children')
  async listChildren(@Param('id') id: string) {
    this.requireSystemBypass();
    return this.tenants.listChildren(id);
  }

  /** Reject anyone not system-flagged via JWT `sys: true` claim. */
  private requireSystemBypass(): void {
    const ctx = this.tenantContext.current();
    if (!ctx?.bypass) {
      throw new ForbiddenException('System privilege required');
    }
  }
}
