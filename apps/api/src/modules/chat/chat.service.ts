import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  async save(
    room: string,
    senderLogin: string,
    senderName: string,
    senderRole: string,
    text: string,
  ): Promise<ChatMessage> {
    const message = this.chatRepo.create({
      room,
      senderLogin,
      senderName,
      senderRole,
      text,
    });
    return this.chatRepo.save(message);
  }

  async getHistory(room: string, limit = 50): Promise<ChatMessage[]> {
    // Fetch the last `limit` messages ordered ASC (oldest first)
    const rows = await this.chatRepo
      .createQueryBuilder('m')
      .where('m.room = :room', { room })
      .orderBy('m.created_at', 'DESC')
      .take(limit)
      .getMany();

    // Reverse so the result is ASC (oldest → newest)
    return rows.reverse();
  }
}
