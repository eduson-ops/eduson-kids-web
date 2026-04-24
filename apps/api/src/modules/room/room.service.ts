import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  async create(teacherId: string, classroomId?: string): Promise<Room> {
    // Temporarily save to get the generated UUID, then set meetLink
    const room = this.roomRepo.create({
      teacherId,
      classroomId: classroomId ?? null,
      status: 'waiting',
      meetLink: '',
    });

    const saved = await this.roomRepo.save(room);
    saved.meetLink = `/room/${saved.id}`;
    return this.roomRepo.save(saved);
  }

  async findOne(id: string): Promise<Room | null> {
    return this.roomRepo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<void> {
    const room = await this.findOne(id);

    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    await this.roomRepo.update(id, { status });
  }
}
