import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

function mockContext(user: { role: string } | undefined, roles?: string[]): ExecutionContext {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles ?? null);

  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'child' } }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow teacher when teacher role required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'teacher' } }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when child tries teacher route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'child' } }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent']);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: undefined }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should allow parent or teacher for multi-role route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent', 'teacher']);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'parent' } }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
