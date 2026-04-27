import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../classroom/classroom.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async listClassrooms(): Promise<Classroom[]> {
    return this.classroomRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createClassroom(name: string, teacherId: string): Promise<Classroom> {
    const classroom = this.classroomRepo.create({ name, teacherId });
    return this.classroomRepo.save(classroom);
  }

  async deleteClassroom(id: string): Promise<void> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom ${id} not found`);
    }

    await this.classroomRepo.delete(id);
  }

  async assignTeacher(classroomId: string, teacherId: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id: classroomId } });

    if (!classroom) {
      throw new NotFoundException(`Classroom ${classroomId} not found`);
    }

    classroom.teacherId = teacherId;
    return this.classroomRepo.save(classroom);
  }

  async transferStudent(
    classroomId: string,
    studentLogin: string,
    toClassroomId: string,
  ): Promise<void> {
    const student = await this.userRepo.findOne({ where: { login: studentLogin } });

    if (!student) {
      throw new NotFoundException(`Student with login "${studentLogin}" not found`);
    }

    if (student.classroomId !== classroomId) {
      throw new BadRequestException(
        `Student "${studentLogin}" does not belong to classroom ${classroomId}`,
      );
    }

    const target = await this.classroomRepo.findOne({ where: { id: toClassroomId } });

    if (!target) {
      throw new NotFoundException(`Target classroom ${toClassroomId} not found`);
    }

    await this.userRepo.update(student.id, { classroomId: toClassroomId });
  }
}
