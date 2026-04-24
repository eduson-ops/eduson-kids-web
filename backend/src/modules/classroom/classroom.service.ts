import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Classroom } from './classroom.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private piiCrypto: PiiCryptoService,
  ) {}

  async create(teacherId: string, name: string): Promise<Classroom> {
    const classroom = this.classroomRepo.create({ teacherId, name });
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

  private generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
