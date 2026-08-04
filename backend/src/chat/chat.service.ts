import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  saveMessage(
    senderId: string,
    content: string,
    receiverId?: string | null,
    groupId?: string | null,
  ) {
    const message = this.messagesRepository.create({
      senderId,
      receiverId: receiverId ?? null,
      groupId: groupId ?? null,
      conversationType: groupId ? 'group' : 'direct',
      content: this.sanitizeContent(content),
    });
    return this.messagesRepository.save(message);
  }

  getConversation(userId: string, otherUserId: string) {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId },
      )
      .andWhere('message.conversationType = :conversationType', {
        conversationType: 'direct',
      })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  getGroupMessages(groupId: string) {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.groupId = :groupId', { groupId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  private sanitizeContent(content: string) {
    return content.replace(/\u0000/g, '').trim();
  }
}
