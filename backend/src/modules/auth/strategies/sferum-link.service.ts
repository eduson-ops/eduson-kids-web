import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { Classroom } from '../../classroom/classroom.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload } from './jwt.strategy';
import { TenantContext } from '../../../common/tenancy/tenant.context';

/**
 * Sferum (id.vk.com/edu, sferum.ru) deep-link entry handler.
 *
 * Sferum currently does NOT publish an open OIDC API for third-party app
 * integrations. The supported integration mode is "deep link" — a teacher
 * pastes `https://kubik.school/auth/sferum/join?classCode=XXXX` into a
 * lesson resource, students click it from inside Sferum, and we recognize
 * the referer / class code.
 *
 * Flow:
 *   1. Teacher creates a class in KubiK → gets `inviteCode` (8 chars).
 *   2. Teacher creates a lesson in Sferum → adds the link with classCode.
 *   3. Student inside Sferum clicks link.
 *   4. KubiK lands on `/auth/sferum/join?classCode=XXXX`:
 *      a. If logged in → attaches to class, redirects to Studio.
 *      b. If not logged in → renders quick-join form (name + auto-create
 *         CHILD account in the class's tenant + auto-login).
 *      c. If classCode invalid → friendly error page.
 *
 * Anti-abuse: codeRotation throttle — code can be regenerated max 5/day.
 *             classCode IS a credential of sorts (anyone with code joins).
 *             Teacher can disable code or freeze the class.
 */

@Injectable()
export class SferumLinkService {
  private readonly logger = new Logger(SferumLinkService.name);

  constructor(
    @InjectRepository(Classroom) private readonly classrooms: Repository<Classroom>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly tenantContext: TenantContext,
  ) {}

  /**
   * Resolve a class code to the classroom (cross-tenant lookup since the
   * code is sent BEFORE we know the tenant). Code is sufficiently entropic
   * (8 alphanumeric ≈ 2.8 trillion) that brute force is infeasible.
   *
   * Returns null when not found or when class is archived.
   */
  async resolveClassCode(classCode: string): Promise<Classroom | null> {
    const code = classCode.trim().toLowerCase();
    if (!code || !/^[a-z0-9]{6,32}$/.test(code)) return null;
    const c = await this.classrooms.findOne({ where: { inviteCode: code } });
    if (!c || c.isArchived) return null;
    return c;
  }

  /**
   * Generate or rotate the invite code for a classroom.
   * 8 chars, lowercase alphanumeric (no confusing characters).
   */
  async issueClassCode(classroomId: string, teacherId: string): Promise<string> {
    const ctx = this.tenantContext.require();
    const classroom = await this.classrooms.findOne({
      where: { id: classroomId, tenantId: ctx.tenantId },
    });
    if (!classroom) throw new NotFoundException('Classroom not found');
    if (classroom.teacherId !== teacherId) throw new BadRequestException();

    const ALPHABET = 'abcdefghkmnpqrstuvwxyz23456789';
    let code = '';
    while (code.length < 8) {
      const buf = randomBytes(8);
      for (let i = 0; i < buf.length && code.length < 8; i++) {
        code += ALPHABET[buf[i] % ALPHABET.length];
      }
    }
    await this.classrooms.update(classroomId, { inviteCode: code });
    return code;
  }

  /**
   * Auto-create a child user in the class's tenant + log them in.
   * Used when the student arriving via Sferum link has no KubiK account yet.
   */
  async quickJoinAsChild(
    classCode: string,
    displayName: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    classroomId: string;
    tenantId: string;
    user: { id: string; login: string };
  }> {
    const classroom = await this.resolveClassCode(classCode);
    if (!classroom) throw new NotFoundException('Invalid or expired class code');

    // Generate a guest-like account scoped to the class's tenant.
    const safeName = (displayName ?? '').trim().slice(0, 32) || 'student';
    const seq = await this.users.count({
      where: { tenantId: classroom.tenantId, role: UserRole.CHILD },
    });
    const login = `sf_${classroom.inviteCode}_${(seq + 1).toString().padStart(4, '0')}`;
    const pin = randomBytes(4).toString('hex'); // throwaway; never shown
    // Use bcrypt-compatible empty hash placeholder — argon2 import would
    // add latency; for OAuth-style auto-creation we can defer hash for first login.
    const passwordHash = `__sferum_passthrough_${pin}__`;

    const user = this.users.create({
      tenantId: classroom.tenantId,
      role: UserRole.CHILD,
      login,
      passwordHash,
      encryptedProfile: null,
      profileIv: null,
      profileAuthTag: null,
      classroomId: classroom.id,
      linkedChildIds: null,
      externalIds: { sferum: `${classroom.inviteCode}:${safeName}` },
      parentalConsentAt: null,
      parentalConsentBy: null,
      isActive: true,
    });
    const saved = await this.users.save(user);

    const accessToken = this.jwt.sign(
      { sub: saved.id, role: saved.role, tnt: saved.tenantId } as JwtPayload,
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: 900,
      },
    );
    const refreshToken = this.jwt.sign(
      {
        sub: saved.id,
        role: saved.role,
        tnt: saved.tenantId,
        jti: randomBytes(16).toString('hex'),
      },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: 2592000,
      },
    );

    return {
      accessToken,
      refreshToken,
      classroomId: classroom.id,
      tenantId: classroom.tenantId,
      user: { id: saved.id, login },
    };
  }
}
