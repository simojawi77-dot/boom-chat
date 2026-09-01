import { BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';

type MessageInput = {
  id: string;
  senderId: string;
  receiverId?: string | null;
  groupId?: string | null;
  conversationType: 'direct' | 'group';
  content: string;
  isRead?: boolean;
  createdAt: Date;
};

class FakeMessageQueryBuilder {
  private scope: 'direct' | 'group' | null = null;
  private userId = '';
  private otherUserId = '';
  private groupId = '';
  private conversationType: 'direct' | 'group' | null = null;
  private beforeCursor: { createdAt: string; id: string } | null = null;
  private createdAtOrder: 'ASC' | 'DESC' = 'ASC';
  private idOrder: 'ASC' | 'DESC' = 'ASC';
  private takeCount = Number.MAX_SAFE_INTEGER;

  constructor(private readonly messages: MessageInput[]) {}

  where(expression: string, params: Record<string, string>) {
    if (expression.includes('senderId = :userId')) {
      this.scope = 'direct';
      this.userId = params.userId;
      this.otherUserId = params.otherUserId;
    } else if (expression.includes('message.groupId = :groupId')) {
      this.scope = 'group';
      this.groupId = params.groupId;
    }

    return this as unknown as SelectQueryBuilder<Message>;
  }

  andWhere(expression: string, params: Record<string, string>) {
    if (expression.includes('conversationType = :conversationType')) {
      this.conversationType = params.conversationType as 'direct' | 'group';
    } else if (expression.includes('beforeCreatedAt')) {
      this.beforeCursor = {
        createdAt: params.beforeCreatedAt,
        id: params.beforeId,
      };
    }

    return this as unknown as SelectQueryBuilder<Message>;
  }

  orderBy(sort: string, order: 'ASC' | 'DESC') {
    if (sort.includes('createdAt')) {
      this.createdAtOrder = order;
    }

    if (sort.includes('.id')) {
      this.idOrder = order;
    }

    return this as unknown as SelectQueryBuilder<Message>;
  }

  addOrderBy(sort: string, order: 'ASC' | 'DESC') {
    return this.orderBy(sort, order);
  }

  take(count: number) {
    this.takeCount = count;
    return this as unknown as SelectQueryBuilder<Message>;
  }

  getMany() {
    let rows = [...this.messages];

    if (this.scope === 'direct') {
      rows = rows.filter(
        (message) =>
          message.conversationType === 'direct' &&
          ((message.senderId === this.userId &&
            message.receiverId === this.otherUserId) ||
            (message.senderId === this.otherUserId &&
              message.receiverId === this.userId)),
      );
    }

    if (this.scope === 'group') {
      rows = rows.filter(
        (message) =>
          message.conversationType === 'group' &&
          message.groupId === this.groupId,
      );
    }

    if (this.conversationType) {
      rows = rows.filter(
        (message) => message.conversationType === this.conversationType,
      );
    }

    if (this.beforeCursor) {
      rows = rows.filter((message) =>
        this.isBefore(message, this.beforeCursor),
      );
    }

    rows.sort((left, right) => {
      const createdAtCompare =
        left.createdAt.getTime() - right.createdAt.getTime();

      if (createdAtCompare !== 0) {
        return this.createdAtOrder === 'ASC'
          ? createdAtCompare
          : -createdAtCompare;
      }

      const idCompare = left.id.localeCompare(right.id);
      return this.idOrder === 'ASC' ? idCompare : -idCompare;
    });

    return rows.slice(0, this.takeCount).map((message) => ({ ...message }));
  }

  private isBefore(
    message: MessageInput,
    cursor: { createdAt: string; id: string },
  ) {
    const createdAtCompare =
      message.createdAt.getTime() - new Date(cursor.createdAt).getTime();

    if (createdAtCompare !== 0) {
      return createdAtCompare < 0;
    }

    return message.id < cursor.id;
  }
}

function createRepository(messages: MessageInput[]) {
  return {
    createQueryBuilder: jest.fn(
      () =>
        new FakeMessageQueryBuilder(
          messages,
        ) as unknown as SelectQueryBuilder<Message>,
    ),
  } as unknown as Repository<Message>;
}

function buildMessage(input: MessageInput) {
  return {
    ...input,
    receiverId: input.receiverId ?? null,
    groupId: input.groupId ?? null,
    isRead: input.isRead ?? false,
  } satisfies MessageInput;
}

describe('ChatService pagination', () => {
  it('paginates conversation messages using limit and before with stable ordering', async () => {
    const sameTime = new Date('2026-08-30T10:00:00.000Z');
    const messages = [
      buildMessage({
        id: 'a',
        senderId: 'user-2',
        receiverId: 'user-1',
        conversationType: 'direct',
        content: 'older-1',
        createdAt: sameTime,
      }),
      buildMessage({
        id: 'b',
        senderId: 'user-1',
        receiverId: 'user-2',
        conversationType: 'direct',
        content: 'older-2',
        createdAt: sameTime,
      }),
      buildMessage({
        id: 'c',
        senderId: 'user-2',
        receiverId: 'user-1',
        conversationType: 'direct',
        content: 'newer-1',
        createdAt: sameTime,
      }),
      buildMessage({
        id: 'd',
        senderId: 'user-1',
        receiverId: 'user-2',
        conversationType: 'direct',
        content: 'newer-2',
        createdAt: sameTime,
      }),
    ];
    const service = new ChatService(createRepository(messages));

    const firstPage = await service.getConversation('user-1', 'user-2', {
      limit: 2,
    });
    const secondPage = await service.getConversation('user-1', 'user-2', {
      limit: 2,
      before: firstPage.nextCursor ?? undefined,
    });

    expect(firstPage.items.map((message) => message.id)).toEqual(['c', 'd']);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).not.toBeNull();
    expect(secondPage.items.map((message) => message.id)).toEqual(['a', 'b']);
    expect(secondPage.hasMore).toBe(false);
    expect(secondPage.nextCursor).toBeNull();
    expect(
      new Set(
        [...firstPage.items, ...secondPage.items].map((message) => message.id),
      ).size,
    ).toBe(4);
  });

  it('paginates group messages with the same cursor semantics', async () => {
    const sameTime = new Date('2026-08-30T11:00:00.000Z');
    const messages = [
      buildMessage({
        id: 'g-a',
        senderId: 'user-1',
        groupId: 'group-1',
        conversationType: 'group',
        content: 'older',
        createdAt: sameTime,
      }),
      buildMessage({
        id: 'g-b',
        senderId: 'user-2',
        groupId: 'group-1',
        conversationType: 'group',
        content: 'middle',
        createdAt: sameTime,
      }),
      buildMessage({
        id: 'g-c',
        senderId: 'user-3',
        groupId: 'group-1',
        conversationType: 'group',
        content: 'newer',
        createdAt: sameTime,
      }),
    ];
    const service = new ChatService(createRepository(messages));

    const firstPage = await service.getGroupMessages('group-1', { limit: 2 });
    const secondPage = await service.getGroupMessages('group-1', {
      limit: 2,
      before: firstPage.nextCursor ?? undefined,
    });

    expect(firstPage.items.map((message) => message.id)).toEqual([
      'g-b',
      'g-c',
    ]);
    expect(firstPage.hasMore).toBe(true);
    expect(secondPage.items.map((message) => message.id)).toEqual(['g-a']);
    expect(secondPage.hasMore).toBe(false);
    expect(secondPage.nextCursor).toBeNull();
  });

  it('rejects invalid cursors', async () => {
    const service = new ChatService(createRepository([]));

    await expect(
      service.getConversation('user-1', 'user-2', { before: 'invalid-cursor' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
