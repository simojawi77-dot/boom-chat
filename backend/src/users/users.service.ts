import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_USERS_QUERY_LIMIT,
  ListUsersQueryDto,
  MAX_USERS_QUERY_LIMIT,
} from './dto/list-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

type UserCursor = {
  createdAt: string;
  id: string;
};

export type PublicUser = Pick<
  User,
  | 'id'
  | 'username'
  | 'displayName'
  | 'firstName'
  | 'lastName'
  | 'city'
  | 'avatarUrl'
  | 'bio'
>;

export type UsersPageResponse = {
  items: PublicUser[];
  nextCursor: string | null;
  hasMore: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (existing) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const displayName =
      [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim() ||
      dto.username;

    const user = this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      city: dto.city,
      dateOfBirth: dto.dateOfBirth,
      phone: dto.phone,
      displayName,
    });

    return this.usersRepository.save(user);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async listPublic(
    currentUserId: string,
    query: ListUsersQueryDto = new ListUsersQueryDto(),
  ): Promise<UsersPageResponse> {
    const normalizedQuery = query.q.trim().toLowerCase();
    const limit = this.normalizeLimit(query.limit);
    const cursor = this.decodeCursor(query.before);

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId });

    if (normalizedQuery) {
      queryBuilder.andWhere(
        "(LOWER(user.username) LIKE :query OR LOWER(COALESCE(user.displayName, '')) LIKE :query OR LOWER(COALESCE(user.city, '')) LIKE :query)",
        {
          query: `%${normalizedQuery}%`,
        },
      );
    }

    if (cursor) {
      queryBuilder.andWhere(
        '(user.createdAt < :beforeCreatedAt OR (user.createdAt = :beforeCreatedAt AND user.id < :beforeId))',
        {
          beforeCreatedAt: cursor.createdAt,
          beforeId: cursor.id,
        },
      );
    }

    const rows = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);

    return {
      items: pageRows.map(
        ({
          id,
          username,
          displayName,
          firstName,
          lastName,
          city,
          avatarUrl,
          bio,
        }) => ({
          id,
          username,
          displayName,
          firstName,
          lastName,
          city,
          avatarUrl,
          bio,
        }),
      ),
      hasMore,
      nextCursor:
        hasMore && pageRows.length > 0
          ? this.encodeCursor(pageRows[pageRows.length - 1])
          : null,
    };
  }

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    if (refreshTokenHash === null) {
      await this.usersRepository.update(userId, {
        refreshTokenHash: () => 'NULL',
      });
      return;
    }

    await this.usersRepository.update(userId, { refreshTokenHash });
  }

  async updateProfile(
    userId: string,
    data: Partial<
      Record<
        'displayName' | 'bio' | 'avatarUrl' | 'coverPhotoUrl',
        string | null
      >
    >,
  ): Promise<User> {
    await this.usersRepository.update(userId, data as never);
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private normalizeLimit(limit?: number) {
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      return DEFAULT_USERS_QUERY_LIMIT;
    }

    return Math.min(MAX_USERS_QUERY_LIMIT, Math.max(1, Math.trunc(limit)));
  }

  private encodeCursor(user: Pick<User, 'createdAt' | 'id'>) {
    return Buffer.from(
      JSON.stringify({
        createdAt: user.createdAt.toISOString(),
        id: user.id,
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
      ) as Partial<UserCursor>;

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
}
