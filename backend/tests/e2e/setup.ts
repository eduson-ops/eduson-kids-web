/**
 * E2E test harness — boots a slim NestJS app for supertest.
 *
 * Strategy: instead of bootstrapping the full AppModule (which hard-depends on
 * Postgres + Redis at startup via TypeOrmModule.forRootAsync and the Throttler
 * Redis storage), we assemble a lightweight test module that only wires the
 * route layer we want to smoke-test. Services are mocked. This keeps tests
 * runnable in CI / overnight without docker.
 *
 * Caveats:
 *  - PG-specific features (RLS, JSONB, partitioned tables) are NOT exercised.
 *  - Real DB integration tests should live under tests/integration/ with a
 *    docker-compose-up Postgres. That's a follow-up sprint (B-15+).
 */
import 'reflect-metadata';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as cookieParser from 'cookie-parser';

import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtStrategy, JwtPayload } from '../../src/modules/auth/strategies/jwt.strategy';
import { TenantsController } from '../../src/modules/tenants/tenants.controller';
import { TenantsService } from '../../src/modules/tenants/tenants.service';
import { ProjectsController } from '../../src/modules/projects/projects.controller';
import { ProjectsService } from '../../src/modules/projects/projects.service';
import { TenantContext } from '../../src/common/tenancy/tenant.context';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

export const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const TEST_JWT_SECRET = 'test-jwt-access-secret-for-e2e-only-do-not-use-in-prod';
export const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

export interface TestContext {
  app: INestApplication;
  jwt: JwtService;
  tenantContext: TenantContext;
  /** Sign a JWT for the test user. Optional `sys` flag for tenant-create endpoints. */
  signToken: (overrides?: Partial<JwtPayload>) => string;
}

/**
 * Mock AuthService — handles the routes we exercise. Returns predictable
 * shapes so the controller-layer tests can assert HTTP contracts without
 * touching argon2/Redis/Postgres.
 */
class MockAuthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loginChild(_dto: unknown, _ip: string) {
    // Always reject — test exercises bad-creds path
    const { UnauthorizedException } = await import('@nestjs/common');
    throw new UnauthorizedException('Invalid credentials');
  }

  async loginParent() {
    const { UnauthorizedException } = await import('@nestjs/common');
    throw new UnauthorizedException('Invalid credentials');
  }

  async loginTeacher() {
    const { UnauthorizedException } = await import('@nestjs/common');
    throw new UnauthorizedException('Invalid credentials');
  }

  async loginGuest() {
    return { accessToken: 'mock-guest-access-token-' + Date.now() };
  }

  async loginChildByCode() {
    return { accessToken: 'mock-child-access-token' };
  }

  async refresh() {
    return { accessToken: 'rotated', refreshToken: 'rotated' };
  }

  async logout() {
    /* no-op */
  }

  async getMe(userId: string) {
    return {
      id: userId,
      role: 'child',
      name: 'Test Kid',
      login: 'test-kid',
      email: undefined,
    };
  }

  async updateAvatar() {
    /* no-op */
  }
}

class MockTenantsService {
  async findById(id: string) {
    return {
      id,
      slug: 'default',
      name: 'Default Tenant',
      tier: 'b2c',
      branding: { color: '#FF6B35' },
      featureFlags: { ai: true },
      quotas: {},
      parentTenantId: null,
    };
  }

  async findBySlug() {
    return { id: TEST_TENANT_ID };
  }

  async create() {
    return { id: 'new-tenant-id', slug: 'new', name: 'New' };
  }

  async update() {
    return { id: 'x', slug: 'updated', name: 'Updated' };
  }

  async listChildren() {
    return [];
  }
}

class MockProjectsService {
  async create(userId: string, dto: { name: string; type: string }) {
    return {
      id: 'proj-1',
      ownerId: userId,
      name: dto.name,
      type: dto.type,
      visibility: 'private',
      tenantId: TEST_TENANT_ID,
    };
  }

  async listForOwner() {
    return [];
  }

  async getLatestContent() {
    return { project: { id: 'proj-1' }, version: { contentJson: {}, sequence: 1 } };
  }

  async save() {
    return { id: 'proj-1', sequence: 2 };
  }

  async softDelete() {
    /* noop */
  }

  async restore() {
    /* noop */
  }

  async listVersions() {
    return [];
  }

  async getVersion() {
    return { contentJson: {}, sequence: 1 };
  }

  async restoreToVersion() {
    return { id: 'proj-1', sequence: 3 };
  }

  async issueShareToken() {
    return 'share-token-abcdef';
  }
}

/**
 * Stub TenantContext that always returns a fixed default tenant — emulates
 * the middleware behavior without needing the actual middleware in the test
 * pipeline (which would require JwtModule + ConfigService + the resolver).
 */
class StubTenantContext extends TenantContext {
  private currentValue = { tenantId: TEST_TENANT_ID, bypass: false };

  override current() {
    return this.currentValue;
  }

  override require() {
    return this.currentValue;
  }

  setBypass(bypass: boolean) {
    this.currentValue = { ...this.currentValue, bypass };
  }
}

/**
 * Mock ConfigService that returns the JWT secret + a small set of values
 * the controllers may peek at. Avoids reading .env or filesystem.
 */
class MockConfigService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): any {
    const map: Record<string, unknown> = {
      'jwt.accessSecret': TEST_JWT_SECRET,
      'jwt.refreshSecret': TEST_JWT_SECRET + '-refresh',
      isProduction: false,
      'cors.whitelist': [],
      schoolCodes: [],
      'throttle.globalTtl': 60000,
      'throttle.globalLimit': 1000,
      'throttle.loginTtl': 900000,
      'throttle.loginLimit': 1000,
    };
    return map[key];
  }
}

export async function createApp(): Promise<TestContext> {
  const stubTenantContext = new StubTenantContext();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
        secret: TEST_JWT_SECRET,
        signOptions: { expiresIn: 900 },
      }),
    ],
    controllers: [AuthController, TenantsController, ProjectsController],
    providers: [
      Reflector,
      JwtAuthGuard,
      JwtStrategy,
      { provide: ConfigService, useClass: MockConfigService },
      { provide: AuthService, useClass: MockAuthService },
      { provide: TenantsService, useClass: MockTenantsService },
      { provide: ProjectsService, useClass: MockProjectsService },
      { provide: TenantContext, useValue: stubTenantContext },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Mirror main.ts setup so DTO validation behaves the same in tests
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  await app.init();

  const jwt = app.get(JwtService);

  const signToken = (overrides: Partial<JwtPayload> = {}): string => {
    return jwt.sign(
      {
        sub: TEST_USER_ID,
        role: 'child',
        tnt: TEST_TENANT_ID,
        ...overrides,
      },
      { secret: TEST_JWT_SECRET, expiresIn: 900 },
    );
  };

  return { app, jwt, tenantContext: stubTenantContext, signToken };
}

/**
 * Build a tiny standalone health controller for the smoke tests. Production
 * health controller hard-binds to TypeOrm + Redis providers which we cannot
 * supply in a no-docker test env, so we test the contract independently.
 */
import { Controller, Get } from '@nestjs/common';
import { Public } from '../../src/common/decorators/public.decorator';
import { AnonymousAllowed } from '../../src/common/tenancy/tenant.guard';

@Controller('health')
@Public()
@AnonymousAllowed()
export class StubHealthController {
  @Get()
  check() {
    return { status: 'ok', info: { database: { status: 'up' }, redis: { status: 'up' } } };
  }

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    return { status: 'ok', info: { database: { status: 'up' }, redis: { status: 'up' } } };
  }
}

export async function createHealthApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [StubHealthController],
    providers: [Reflector],
  }).compile();

  const app = moduleRef.createNestApplication();
  // Production main.ts excludes 'health' from the global prefix; in this stub
  // app we skip the prefix entirely so /health, /health/live, /health/ready
  // resolve at the root just like production.
  await app.init();
  return app;
}

/** Helper for tests that need to inspect what the guard sees. */
export function noopExecutionContext(): ExecutionContext {
  return {} as ExecutionContext;
}
