import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

type UserRow = {
  id: string;
  username: string;
  displayName?: string;
  city?: string;
  createdAt: Date;
};

class FakeUsersQueryBuilder {
  private currentUserId = '';
  private query = '';
  private before: { createdAt: string; id: string } | null = null;
  private takeCount = Number.MAX_SAFE_INTEGER;

  constructor(private readonly users: UserRow[]) {}

  where(expression: string, params: Record<string, string>) {
    if (expression.includes('user.id != :currentUserId')) {
      this.currentUserId = params.currentUserId;
    }
    return this;
  }

  andWhere(expression: string, params: Record<string, string>) {
    if (expression.includes('LOWER(user.username)')) {
      this.query = params.query.replace(/^%|%$/g, '').toLowerCase();
    }
    if (expression.includes('beforeCreatedAt')) {
      this.before = { createdAt: params.beforeCreatedAt, id: params.beforeId };
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
    let rows = this.users.filter((user) => user.id !== this.currentUserId);

    if (this.query) {
      rows = rows.filter((user) =>
        [user.username, user.displayName, user.city]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(this.query)),
      );
    }

    if (this.before) {
      rows = rows.filter((user) => {
        const time = user.createdAt.getTime();
        const cursorTime = new Date(this.before!.createdAt).getTime();
        return (
          time < cursorTime ||
          (time === cursorTime && user.id < this.before!.id)
        );
      });
    }

    rows.sort((left, right) => {
      const time = right.createdAt.getTime() - left.createdAt.getTime();
      return time || right.id.localeCompare(left.id);
    });

    return rows.slice(0, this.takeCount);
  }
}

function createUsersRepository(users: UserRow[]) {
  return {
    createQueryBuilder: jest.fn(() => new FakeUsersQueryBuilder(users)),
  } as never;
}

describe('UsersService pagination', () => {
  const sameTime = new Date('2026-08-30T10:00:00.000Z');
  const users: UserRow[] = [
    {
      id: 'a',
      username: 'alpha',
      displayName: 'Alpha',
      city: 'Rabat',
      createdAt: new Date('2026-08-31T10:00:00.000Z'),
    },
    {
      id: 'b',
      username: 'bravo',
      displayName: 'Bravo',
      city: 'Fes',
      createdAt: sameTime,
    },
    {
      id: 'c',
      username: 'charlie',
      displayName: 'Charlie',
      city: 'Marrakesh',
      createdAt: sameTime,
    },
    {
      id: 'me',
      username: 'current',
      displayName: 'Current',
      city: 'Rabat',
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
    },
  ];

  it('uses the default limit, ordering, envelope, and excludes the current user', async () => {
    const result = await new UsersService(
      createUsersRepository(users),
    ).listPublic('me');

    expect(result).toMatchObject({ hasMore: false, nextCursor: null });
    expect(result.items.map((user) => user.id)).toEqual(['a', 'c', 'b']);
    expect(result.items).not.toContainEqual(
      expect.objectContaining({ id: 'me' }),
    );
  });

  it('uses the maximum limit and stable createdAt plus id cursor pagination', async () => {
    const manyUsers = Array.from({ length: 101 }, (_, index) => ({
      id: `user-${String(index).padStart(3, '0')}`,
      username: `user${index}`,
      createdAt: new Date(2026, 0, 1, 0, 0, index),
    }));
    const service = new UsersService(createUsersRepository(manyUsers));
    const first = await service.listPublic('nobody', {
      q: '',
      limit: 100,
    });
    const second = await service.listPublic('nobody', {
      q: '',
      limit: 100,
      before: first.nextCursor!,
    });

    expect(first.items).toHaveLength(100);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toEqual(expect.any(String));
    expect(second.items).toHaveLength(1);
    expect(
      new Set([...first.items, ...second.items].map((user) => user.id)).size,
    ).toBe(101);
  });

  it('preserves case-insensitive username, displayName, and city search', async () => {
    const service = new UsersService(createUsersRepository(users));

    expect(
      (await service.listPublic('me', { q: 'ALPH' })).items.map(
        (user) => user.id,
      ),
    ).toEqual(['a']);
    expect(
      (await service.listPublic('me', { q: 'BRAVO' })).items.map(
        (user) => user.id,
      ),
    ).toEqual(['b']);
    expect(
      (await service.listPublic('me', { q: 'MARR' })).items.map(
        (user) => user.id,
      ),
    ).toEqual(['c']);
  });

  it('rejects an invalid cursor', async () => {
    const service = new UsersService(createUsersRepository(users));

    await expect(
      service.listPublic('me', { q: '', before: 'invalid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
