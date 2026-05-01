import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { Classroom } from './classroom.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';
import { TenantContext } from '../../common/tenancy/tenant.context';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private piiCrypto: PiiCryptoService,
    private readonly tenantContext: TenantContext,
  ) {}

  async create(teacherId: string, name: string): Promise<Classroom> {
    const ctx = this.tenantContext.require();
    const inviteCode = randomBytes(4).toString('hex').toUpperCase(); // 8-char hex
    const classroom = this.classroomRepo.create({
      teacherId,
      name,
      tenantId: ctx.tenantId,
      inviteCode,
    });
    return this.classroomRepo.save(classroom);
  }

  async findById(id: string): Promise<Classroom> {
    const ctx = this.tenantContext.require();
    const classroom = await this.classroomRepo.findOne({ where: { id, tenantId: ctx.tenantId } });
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  async update(id: string, teacherId: string, name: string): Promise<Classroom> {
    const classroom = await this.findById(id);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();
    classroom.name = name;
    return this.classroomRepo.save(classroom);
  }

  async delete(id: string, teacherId: string): Promise<void> {
    const ctx = this.tenantContext.require();
    const classroom = await this.findById(id);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();
    await this.classroomRepo.delete({ id, tenantId: ctx.tenantId });
  }

  async addStudents(
    classroomId: string,
    teacherId: string,
    count: number,
    namePrefix: string,
  ): Promise<Array<{ login: string; pin: string }>> {
    const ctx = this.tenantContext.require();
    const classroom = await this.findById(classroomId);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();

    const students: Array<{ login: string; pin: string }> = [];

    await this.dataSource.transaction(async (manager) => {
      for (let i = 1; i <= count; i++) {
        const pin = this.generatePin();
        const login = `${namePrefix}-${i}-${randomBytes(2).toString('hex')}`.toLowerCase();

        const passwordHash = await argon2.hash(pin, { type: argon2.argon2id });

        const profile = this.piiCrypto.encryptObject({ firstName: `${namePrefix}-${i}` });
        const user = manager.create(User, {
          tenantId: ctx.tenantId,
          login,
          role: UserRole.CHILD,
          passwordHash,
          classroomId,
          encryptedProfile: profile.ciphertext,
          profileIv: profile.iv,
          profileAuthTag: profile.authTag,
          isActive: true,
        });
        await manager.save(User, user);
        students.push({ login, pin });
      }

      await manager.increment(
        Classroom,
        { id: classroomId, tenantId: ctx.tenantId },
        'studentCount',
        count,
      );
    });

    return students;
  }

  async findAllByTeacher(teacherId: string): Promise<Classroom[]> {
    const ctx = this.tenantContext.require();
    return this.classroomRepo.find({
      where: { teacherId, tenantId: ctx.tenantId, isArchived: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getStudents(classroomId: string, teacherId: string): Promise<User[]> {
    const classroom = await this.findById(classroomId);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();
    const ctx = this.tenantContext.require();
    return this.userRepo.find({
      where: { classroomId, tenantId: ctx.tenantId, role: UserRole.CHILD },
      order: { createdAt: 'ASC' },
      select: ['id', 'login', 'classroomId', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
    });
  }

  async transferStudent(
    studentId: string,
    fromClassroomId: string,
    toClassroomId: string,
    teacherId: string,
  ): Promise<void> {
    const ctx = this.tenantContext.require();
    const [from, to] = await Promise.all([
      this.findById(fromClassroomId),
      this.findById(toClassroomId),
    ]);
    if (from.teacherId !== teacherId && to.teacherId !== teacherId) {
      throw new ForbiddenException('Must own at least one of the classrooms');
    }
    const student = await this.userRepo.findOne({
      where: { id: studentId, classroomId: fromClassroomId, tenantId: ctx.tenantId },
    });
    if (!student) throw new NotFoundException('Student not found in source classroom');

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, { id: studentId }, { classroomId: toClassroomId });
      await manager.decrement(Classroom, { id: fromClassroomId }, 'studentCount', 1);
      await manager.increment(Classroom, { id: toClassroomId }, 'studentCount', 1);
    });
  }

  /**
   * Cryptographically-secure 6-char alphanumeric PIN from a confusion-free
   * alphabet (no 0/1/O/l/I/5/S/j). Matches PIN_ALPHABET in StudentRosterService.
   */
  private generatePin(): string {
    const ALPHA = 'abcdefghkmnpqrtuvwxyz2346789';
    const buf = randomBytes(6);
    let pin = '';
    for (let i = 0; i < 6; i++) pin += ALPHA[buf[i] % ALPHA.length];
    return pin;
  }
}
