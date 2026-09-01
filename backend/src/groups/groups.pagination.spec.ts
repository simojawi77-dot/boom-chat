import { BadRequestException } from '@nestjs/common';
import { GroupsService } from './groups.service';

type MembershipRow = {
  id: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  group: {
    id: string;
    name: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: null;
  };
};

class FakeGroupsQueryBuilder {
  private userId = '';
  private before: { joinedAt: string; id: string } | null = null;
  private takeCount = Number.MAX_SAFE_INTEGER;

  constructor(private readonly memberships: MembershipRow[]) {}

  leftJoinAndSelect() {
    return this;
  }

  where(expression: string, params: Record<string, string>) {
    if (expression.includes('membership.userId')) this.userId = params.userId;
    return this;
  }

  andWhere(expression: string, params: Record<string, string>) {
    if (expression.includes('beforeJoinedAt')) {
      this.before = { joinedAt: params.beforeJoinedAt, id: params.beforeId };
    }
    return this;
  }

  orderBy() {
    return this;
  }
  addOrderBy() {
    return this;
  }

  take(count: number) {
    this.takeCount = count;
    return this;
  }

  getMany() {
    let rows = this.memberships.filter(
      (membership) => membership.userId === this.userId,
    );

    if (this.before) {
      rows = rows.filter((membership) => {
        const time = membership.joinedAt.getTime();
        const cursorTime = new Date(this.before!.joinedAt).getTime();
        return (
          time > cursorTime ||
          (time === cursorTime && membership.id > this.before!.id)
        );
      });
    }

    rows.sort((left, right) => {
      const time = left.joinedAt.getTime() - right.joinedAt.getTime();
      return time || left.id.localeCompare(right.id);
    });

    return rows.slice(0, this.takeCount);
  }
}

function createGroupsRepository(memberships: MembershipRow[]) {
  return {
    createQueryBuilder: jest.fn(() => new FakeGroupsQueryBuilder(memberships)),
  } as never;
}

describe('GroupsService pagination', () => {
  const sameTime = new Date('2026-08-30T10:00:00.000Z');
  const group = (id: string) => ({
    id,
    name: `Group ${id}`,
    createdById: 'owner',
    createdAt: sameTime,
    updatedAt: sameTime,
    createdBy: null,
  });
  const memberships: MembershipRow[] = [
    {
      id: 'a',
      userId: 'me',
      role: 'admin',
      joinedAt: sameTime,
      group: group('a'),
    },
    {
      id: 'b',
      userId: 'me',
      role: 'member',
      joinedAt: sameTime,
      group: group('b'),
    },
    {
      id: 'c',
      userId: 'me',
      role: 'member',
      joinedAt: new Date('2026-08-31T10:00:00.000Z'),
      group: group('c'),
    },
    {
      id: 'other',
      userId: 'other',
      role: 'admin',
      joinedAt: new Date('2026-08-29T10:00:00.000Z'),
      group: group('other'),
    },
  ];

  it('uses the default limit, joinedAt ordering, membership filtering, and myRole', async () => {
    const service = new GroupsService(
      {} as never,
      createGroupsRepository(memberships),
      {} as never,
    );
    const result = await service.getUserGroups('me');

    expect(result).toMatchObject({ hasMore: false, nextCursor: null });
    expect(result.items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(result.items.map((item) => item.myRole)).toEqual([
      'admin',
      'member',
      'member',
    ]);
  });

  it('paginates with joinedAt plus id without duplicates', async () => {
    const service = new GroupsService(
      {} as never,
      createGroupsRepository(memberships),
      {} as never,
    );
    const first = await service.getUserGroups('me', { limit: 2 });
    const second = await service.getUserGroups('me', {
      limit: 2,
      before: first.nextCursor!,
    });

    expect(first.items.map((item) => item.id)).toEqual(['a', 'b']);
    expect(first.hasMore).toBe(true);
    expect(second.items.map((item) => item.id)).toEqual(['c']);
    expect(
      new Set([...first.items, ...second.items].map((item) => item.id)).size,
    ).toBe(3);
  });

  it('accepts the maximum limit and rejects an invalid cursor', async () => {
    const service = new GroupsService(
      {} as never,
      createGroupsRepository(memberships),
      {} as never,
    );
    const result = await service.getUserGroups('me', { limit: 100 });

    expect(result.items).toHaveLength(3);
    await expect(
      service.getUserGroups('me', { before: 'invalid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
