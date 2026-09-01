import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ListMessagesQueryDto,
  DEFAULT_CHAT_MESSAGE_LIMIT,
  MAX_CHAT_MESSAGE_LIMIT,
} from './dto/list-messages-query.dto';
import { Message } from './entities/message.entity';

export type PaginatedMessagesResponse = {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
};

type Cursor = {
  createdAt: string;
  id: string;
};

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

  getConversation(
    userId: string,
    otherUserId: string,
    query: ListMessagesQueryDto = new ListMessagesQueryDto(),
  ) {
    return this.getPaginatedMessages(
      (queryBuilder) =>
        queryBuilder
          .where(
            '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
            { userId, otherUserId },
          )
          .andWhere('message.conversationType = :conversationType', {
            conversationType: 'direct',
          }),
      query,
    );
  }

  getGroupMessages(
    groupId: string,
    query: ListMessagesQueryDto = new ListMessagesQueryDto(),
  ) {
    return this.getPaginatedMessages(
      (queryBuilder) =>
        queryBuilder
          .where('message.groupId = :groupId', { groupId })
          .andWhere('message.conversationType = :conversationType', {
            conversationType: 'group',
          }),
      query,
    );
  }

  private async getPaginatedMessages(
    buildQuery: (
      queryBuilder: SelectQueryBuilder<Message>,
    ) => SelectQueryBuilder<Message>,
    query: ListMessagesQueryDto,
  ): Promise<PaginatedMessagesResponse> {
    const normalizedLimit = this.normalizeLimit(query.limit);
    const cursor = this.decodeCursor(query.before);

    const queryBuilder = buildQuery(
      this.messagesRepository.createQueryBuilder('message'),
    );

    if (cursor) {
      queryBuilder.andWhere(
        '(message.createdAt < :beforeCreatedAt OR (message.createdAt = :beforeCreatedAt AND message.id < :beforeId))',
        {
          beforeCreatedAt: cursor.createdAt,
          beforeId: cursor.id,
        },
      );
    }

    const rows = await queryBuilder
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .take(normalizedLimit + 1)
      .getMany();

    const hasMore = rows.length > normalizedLimit;
    const items = rows.slice(0, normalizedLimit).reverse();

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && items.length > 0 ? this.encodeCursor(items[0]) : null,
    };
  }

  private normalizeLimit(limit?: number) {
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      return DEFAULT_CHAT_MESSAGE_LIMIT;
    }

    return Math.min(MAX_CHAT_MESSAGE_LIMIT, Math.max(1, Math.trunc(limit)));
  }

  private encodeCursor(message: Pick<Message, 'createdAt' | 'id'>) {
    return Buffer.from(
      JSON.stringify({
        createdAt: message.createdAt.toISOString(),
        id: message.id,
      }),
    ).toString('base64url');
  }

  private decodeCursor(before?: string) {
    if (!before) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(before, 'base64url').toString('utf8'),
      ) as Partial<Cursor>;

      if (
        typeof parsed.createdAt !== 'string' ||
        Number.isNaN(Date.parse(parsed.createdAt)) ||
        typeof parsed.id !== 'string' ||
        !parsed.id
      ) {
        throw new Error('Invalid cursor');
      }

      return {
        createdAt: new Date(parsed.createdAt).toISOString(),
        id: parsed.id,
      };
    } catch {
      throw new BadRequestException('Invalid before cursor');
    }
  }

  private sanitizeContent(content: string) {
    return content.split('\u0000').join('').trim();
  }
}
