import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('chat_messages')
@Index(['room', 'createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  room!: string;

  @Column({ type: 'varchar', length: 255, name: 'sender_login' })
  senderLogin!: string;

  @Column({ type: 'varchar', length: 128, name: 'sender_name' })
  senderName!: string;

  @Column({ type: 'varchar', length: 32, name: 'sender_role' })
  senderRole!: string;

  @Column({ type: 'varchar', length: 2000 })
  text!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
