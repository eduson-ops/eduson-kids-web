import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Classroom } from './classroom.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';

const TEACHER_ADMIN_ROLES = new Set([
  'teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin',
]);

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private piiCrypto: PiiCryptoService,
  ) {}

  async list(actorId: string, role: string): Promise<Classroom[]> {
    const isAdmin = !TEACHER_ADMIN_ROLES.has(role) === false && role !== 'teacher';
    const where = isAdmin && role !== 'teacher' ? {} : { teacherId: actorId };
    return this.classroomRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getStudents(classroomId: string): Promise<Omit<User, 'passwordHash' | 'encryptedProfile' | 'profileIv' | 'profileAuthTag'>[]> {
    const users = await this.userRepo.find({
      where: { classroomId, role: UserRole.CHILD, isActive: true },
      order: { login: 'ASC' },
    });
    return users.map(({ passwordHash: _p, encryptedProfile: _e, profileIv: _i, profileAuthTag: _a, ...rest }) => rest as any);
  }

  async create(teacherId: string, name: string): Promise<Classroom> {
    const inviteCode = randomBytes(3).toString('hex').toUpperCase();
    const classroom = this.classroomRepo.create({ teacherId, name, inviteCode });
    return this.classroomRepo.save(classroom);
  }

  async findById(id: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });
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
    const classroom = await this.findById(id);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();
    await this.classroomRepo.delete(id);
  }

  async addStudents(
    classroomId: string,
    teacherId: string,
    count: number,
    namePrefix: string,
  ): Promise<Array<{ login: string; pin: string }>> {
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

      await manager.increment(Classroom, { id: classroomId }, 'studentCount', count);
    });

    return students;
  }

  async bulkCreateStudents(
    classroomId: string,
    teacherId: string,
    students: Array<{ firstName: string; lastName?: string; birthYear?: number }>,
  ): Promise<Array<{ login: string; pin: string }>> {
    const classroom = await this.findById(classroomId);
    if (classroom.teacherId !== teacherId) throw new ForbiddenException();

    const results: Array<{ login: string; pin: string }> = [];

    await this.dataSource.transaction(async (manager) => {
      for (const s of students) {
        const pin = this.generatePin();
        const base = (s.lastName ?? s.firstName).toLowerCase().replace(/[^a-z]/g, '') || 'stu';
        const login = `${base}_${randomBytes(2).toString('hex')}`;
        const passwordHash = await argon2.hash(pin, { type: argon2.argon2id });
        const profile = this.piiCrypto.encryptObject({
          firstName: s.firstName,
          lastName: s.lastName,
          birthYear: s.birthYear,
        });
        await manager.save(User, manager.create(User, {
          login,
          role: UserRole.CHILD,
          passwordHash,
          classroomId,
          encryptedProfile: profile.ciphertext,
          profileIv: profile.iv,
          profileAuthTag: profile.authTag,
          isActive: true,
        }));
        results.push({ login, pin });
      }
      await manager.increment(Classroom, { id: classroomId }, 'studentCount', students.length);
    });

    return results;
  }

  async transferStudent(fromClassroomId: string, studentId: string, toClassroomId: string): Promise<void> {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    if (student.classroomId !== fromClassroomId) throw new ForbiddenException('Student not in source classroom');
    const target = await this.classroomRepo.findOne({ where: { id: toClassroomId } });
    if (!target) throw new NotFoundException('Target classroom not found');
    await this.userRepo.update(student.id, { classroomId: toClassroomId });
    await this.classroomRepo.decrement({ id: fromClassroomId }, 'studentCount', 1);
    await this.classroomRepo.increment({ id: toClassroomId }, 'studentCount', 1);
  }

  private generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
