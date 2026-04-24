import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type RoomStatus = 'waiting' | 'active' | 'ended';

@Entity('rooms')
@Index(['teacherId'])
@Index(['classroomId'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroomId!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'teacher_id' })
  teacherId!: string;

  @Column({
    type: 'varchar',
    length: 16,
    default: 'waiting',
  })
  status!: RoomStatus;

  @Column({ type: 'varchar', length: 512, name: 'meet_link' })
  meetLink!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
