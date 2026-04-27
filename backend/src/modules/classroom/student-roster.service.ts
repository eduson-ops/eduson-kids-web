import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { Classroom } from './classroom.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';
import { TenantContext } from '../../common/tenancy/tenant.context';
import { TenantsService } from '../tenants/tenants.service';

/**
 * Bulk-create students for a classroom + generate human-friendly logins and
 * PINs that can be printed and handed out on paper. Modeled after the Учи.ру
 * teacher experience — the killer onboarding feature for school B2G.
 *
 * Design points:
 *
 * 1. Logins look like `kub_{tenantSlug}_{seq4}` (e.g. `kub_msh42_0017`).
 *    Tenant-scoped uniqueness means the same login can exist in different
 *    schools without collision (enforced by the tenant_login unique index).
 *
 * 2. PINs are 6 ALPHA-NUMERIC characters from a confusion-free alphabet
 *    (no `0/O/o`, `1/l/I/i`, `5/S`). 6 chars × 30-symbol alphabet ≈ 729M
 *    combinations — enough entropy for child accounts that ALSO have IP
 *    rate-limiting + Redis-backed brute-force lockout (existing AuthService).
 *
 * 3. Plaintext PINs are returned ONLY in the response payload of the bulk
 *    endpoint. They are immediately hashed with Argon2id and never stored
 *    in plaintext. If the teacher loses the PDF, the platform regenerates
 *    a new PIN; the old one is unrecoverable. This is intentional —
 *    parents/teachers must keep the printed sheet safe.
 *
 * 4. Quota enforcement: the active tenant must have enough room
 *    (`maxStudents - currentCount >= addCount`) to create. Quota is per
 *    tenant, not per classroom; see `TenantsService.defaultQuotas`.
 */

// 29-char confusion-free alphabet (no 0,1,5,O,o,l,j,I,i,S)
const PIN_ALPHABET = 'abcdefghkmnpqrtuvwxyz2346789';
const LOGIN_PREFIX = 'kub';

export interface NewStudentInput {
  firstName: string;
  lastName?: string;
  birthYear?: number;
}

export interface CreatedStudent {
  id: string;
  login: string;
  pin: string;
  firstName: string;
  lastName: string | null;
}

@Injectable()
export class StudentRosterService {
  constructor(
    @InjectRepository(Classroom) private readonly classroomRepo: Repository<Classroom>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly piiCrypto: PiiCryptoService,
    private readonly tenantContext: TenantContext,
    private readonly tenantsService: TenantsService,
  ) {}

  async bulkCreateStudents(
    classroomId: string,
    teacherId: string,
    students: NewStudentInput[],
  ): Promise<CreatedStudent[]> {
    if (!students || students.length === 0) {
      throw new BadRequestException('students[] cannot be empty');
    }
    if (students.length > 50) {
      throw new BadRequestException('Cannot create more than 50 students at once');
    }

    const ctx = this.tenantContext.require();
    const classroom = await this.classroomRepo.findOne({ where: { id: classroomId } });
    if (!classroom) throw new NotFoundException('Classroom not found');
    if (classroom.tenantId !== ctx.tenantId) throw new ForbiddenException();
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();

    // Quota enforcement
    const tenant = await this.tenantsService.findById(ctx.tenantId);
    const maxStudents = tenant.quotas?.maxStudents ?? Number.MAX_SAFE_INTEGER;
    const currentCount = await this.userRepo.count({
      where: { tenantId: ctx.tenantId, role: UserRole.CHILD, isActive: true },
    });
    if (currentCount + students.length > maxStudents) {
      throw new BadRequestException(
        `Tenant quota exceeded: ${currentCount}/${maxStudents}, attempting +${students.length}`,
      );
    }

    const tenantSlug = (tenant.slug ?? 'kid').replace(/[^a-z0-9]/gi, '').slice(0, 12);

    // D-03: Pre-compute pins + Argon2id hashes in parallel BEFORE the
    // transaction. Argon2id is intentionally CPU-heavy (~50-100ms each); it
    // runs on the libuv worker pool (4 workers by default), so Promise.all
    // overlaps work across cores while leaving the event loop free for other
    // requests. For 50 students this drops ~2.5s sequential to ~600-800ms.
    const pins = students.map(() => this.generatePin());
    const passwordHashes = await Promise.all(
      pins.map((pin) => argon2.hash(pin, { type: argon2.argon2id })),
    );
    const profiles = students.map((s) =>
      this.piiCrypto.encryptObject({
        firstName: s.firstName,
        lastName: s.lastName ?? null,
        birthYear: s.birthYear ?? null,
      }),
    );

    const created: CreatedStudent[] = [];

    // D-04: Wrap in a transaction holding a tenant-keyed PostgreSQL advisory
    // lock. The previous count(*) → seq+1 design had a race: two concurrent
    // bulk-creates in the same tenant could both read N and both try to
    // insert kub_<slug>_(N+1), failing the tenant_login UNIQUE index.
    //
    // pg_advisory_xact_lock(key) serializes only callers that pass the same
    // key (per-tenant lock — different tenants stay parallel) and auto-releases
    // at COMMIT/ROLLBACK. Chosen over SERIALIZABLE because the latter would
    // serialize unrelated writes too.
    await this.dataSource.transaction(async (manager) => {
      const lockKey = this.tenantLockKey(ctx.tenantId);
      await manager.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);

      const seqStart = await this.getNextSeq(manager, ctx.tenantId);
      for (let i = 0; i < students.length; i++) {
        const seq = (seqStart + i).toString().padStart(4, '0');
        const login = `${LOGIN_PREFIX}_${tenantSlug}_${seq}`;
        const profile = profiles[i];

        const user = manager.create(User, {
          tenantId: ctx.tenantId,
          login,
          role: UserRole.CHILD,
          passwordHash: passwordHashes[i],
          classroomId,
          encryptedProfile: profile.ciphertext,
          profileIv: profile.iv,
          profileAuthTag: profile.authTag,
          externalIds: {},
          parentalConsentAt: null,
          parentalConsentBy: null,
          isActive: true,
        });
        const saved = await manager.save(User, user);

        created.push({
          id: saved.id,
          login,
          pin: pins[i],
          firstName: students[i].firstName,
          lastName: students[i].lastName ?? null,
        });
      }

      await manager.increment(Classroom, { id: classroomId }, 'studentCount', students.length);
    });

    return created;
  }

  /**
   * Hash a tenant UUID into a 64-bit integer for `pg_advisory_xact_lock`.
   * Uses the first 16 hex chars of the UUID (after stripping dashes), then
   * shifts into the signed BIGINT range Postgres expects. Collisions are
   * possible but harmless — at worst two unrelated tenants share a lock and
   * one waits ~50ms.
   */
  private tenantLockKey(tenantId: string): string {
    const hex = tenantId.replace(/-/g, '').slice(0, 16);
    let n = BigInt('0x' + hex);
    // Coerce into signed 64-bit range expected by Postgres bigint arg.
    const MAX = BigInt('0x7fffffffffffffff');
    const SIGN = BigInt('0x8000000000000000');
    if (n > MAX) n = n - SIGN;
    return n.toString();
  }

  /**
   * Find the next sequence number for the tenant. Race-safe inside the
   * advisory-locked transaction in `bulkCreateStudents` (callers from
   * different tenants run in parallel; same-tenant callers serialize on the
   * tenant-keyed `pg_advisory_xact_lock`).
   */
  private async getNextSeq(manager: EntityManager, tenantId: string): Promise<number> {
    const count = await manager.count(User, {
      where: { tenantId, role: UserRole.CHILD },
    });
    return count + 1;
  }

  /**
   * Rotate PINs for every student of a class and return the new plaintext
   * PINs. Used by the PDF re-print endpoint when the teacher loses the
   * original sheet — old PINs are unrecoverable, so we issue fresh ones.
   *
   * Returns the same shape as bulkCreate so PdfRosterService can render.
   */
  async regeneratePinsAndGetCards(
    classroomId: string,
    teacherId: string,
  ): Promise<CreatedStudent[]> {
    const ctx = this.tenantContext.require();
    const classroom = await this.classroomRepo.findOne({ where: { id: classroomId } });
    if (!classroom) throw new NotFoundException('Classroom not found');
    if (classroom.tenantId !== ctx.tenantId) throw new ForbiddenException();
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();

    const students = await this.userRepo.find({
      where: { classroomId, tenantId: ctx.tenantId, role: UserRole.CHILD, isActive: true },
      order: { login: 'ASC' },
    });

    // D-03: Pre-compute fresh PINs + Argon2id hashes in parallel before the
    // transaction so the libuv worker pool overlaps the CPU-heavy hashing
    // (~50-100ms each) across cores. 30 students drop from ~2s sequential to
    // ~500ms on a 4-core box.
    const newPins = students.map(() => this.generatePin());
    const newHashes = await Promise.all(
      newPins.map((pin) => argon2.hash(pin, { type: argon2.argon2id })),
    );

    const result: CreatedStudent[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        await manager.update(User, { id: student.id }, { passwordHash: newHashes[i] });

        let firstName = '';
        let lastName: string | null = null;
        if (student.encryptedProfile && student.profileIv && student.profileAuthTag) {
          try {
            const profile = this.piiCrypto.decryptObject({
              ciphertext: student.encryptedProfile,
              iv: student.profileIv,
              authTag: student.profileAuthTag,
            }) as { firstName?: string; lastName?: string | null };
            firstName = profile.firstName ?? '';
            lastName = profile.lastName ?? null;
          } catch {
            // Decrypt failed — fallback to login
            firstName = student.login;
          }
        } else {
          firstName = student.login;
        }

        result.push({
          id: student.id,
          login: student.login,
          pin: newPins[i],
          firstName,
          lastName,
        });
      }
    });

    return result;
  }

  private generatePin(): string {
    const buf = randomBytes(6);
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += PIN_ALPHABET[buf[i] % PIN_ALPHABET.length];
    }
    return pin;
  }
}
