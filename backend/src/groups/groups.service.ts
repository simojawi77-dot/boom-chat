import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import {
  DEFAULT_GROUPS_QUERY_LIMIT,
  ListGroupsQueryDto,
  MAX_GROUPS_QUERY_LIMIT,
} from './dto/list-groups-query.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { GroupMember, GroupMemberRole } from './entities/group-member.entity';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';

type PublicUser = Pick<
  User,
  | 'id'
  | 'username'
  | 'displayName'
  | 'avatarUrl'
  | 'coverPhotoUrl'
  | 'bio'
  | 'createdAt'
>;

type GroupSummary = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdById: string;
  createdBy: PublicUser | null;
  createdAt: Date;
  updatedAt: Date;
};

type GroupCursor = {
  joinedAt: string;
  id: string;
};

export type GroupsPageResponse = {
  items: Array<GroupSummary & { myRole: GroupMemberRole }>;
  nextCursor: string | null;
  hasMore: boolean;
};

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    private readonly usersService: UsersService,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    const group = this.groupsRepository.create({
      ...dto,
      createdById: userId,
    });

    const savedGroup = await this.groupsRepository.save(group);

    await this.groupMembersRepository.save(
      this.groupMembersRepository.create({
        groupId: savedGroup.id,
        userId,
        role: 'admin',
      }),
    );

    return this.getGroupById(savedGroup.id, userId);
  }

  async getGroupById(groupId: string, userId: string) {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['createdBy', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const membership = group.members.find((member) => member.userId === userId);

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.toGroupResponse(group, membership.role);
  }

  async getUserGroups(
    userId: string,
    query: ListGroupsQueryDto = new ListGroupsQueryDto(),
  ): Promise<GroupsPageResponse> {
    const limit = this.normalizeLimit(query.limit);
    const cursor = this.decodeCursor(query.before);

    const queryBuilder = this.groupMembersRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.group', 'group')
      .leftJoinAndSelect('group.createdBy', 'createdBy')
      .where('membership.userId = :userId', { userId });

    if (cursor) {
      queryBuilder.andWhere(
        '(membership.joinedAt > :beforeJoinedAt OR (membership.joinedAt = :beforeJoinedAt AND membership.id > :beforeId))',
        {
          beforeJoinedAt: cursor.joinedAt,
          beforeId: cursor.id,
        },
      );
    }

    const rows = await queryBuilder
      .orderBy('membership.joinedAt', 'ASC')
      .addOrderBy('membership.id', 'ASC')
      .take(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);

    return {
      items: pageRows.map((membership) => ({
        ...this.toGroupSummary(membership.group),
        myRole: membership.role,
      })),
      hasMore,
      nextCursor:
        hasMore && pageRows.length > 0
          ? this.encodeCursor(pageRows[pageRows.length - 1])
          : null,
    };
  }

  async updateGroup(groupId: string, userId: string, dto: UpdateGroupDto) {
    await this.ensureAdmin(groupId, userId);

    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    Object.assign(group, dto);
    await this.groupsRepository.save(group);

    return this.getGroupById(groupId, userId);
  }

  async deleteGroup(groupId: string, userId: string) {
    await this.ensureAdmin(groupId, userId);

    const result = await this.groupsRepository.delete(groupId);

    if (!result.affected) {
      throw new NotFoundException('Group not found');
    }
  }

  async addMember(groupId: string, userId: string, dto: AddMemberDto) {
    await this.ensureAdmin(groupId, userId);

    const targetUser = await this.usersService.findById(dto.userId);

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.groupMembersRepository.findOne({
      where: { groupId, userId: dto.userId },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this group');
    }

    await this.groupMembersRepository.save(
      this.groupMembersRepository.create({
        groupId,
        userId: dto.userId,
        role: dto.role ?? 'member',
      }),
    );

    return this.getGroupById(groupId, userId);
  }

  async removeMember(groupId: string, userId: string, memberUserId: string) {
    await this.ensureAdmin(groupId, userId);

    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId: memberUserId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    await this.groupMembersRepository.remove(membership);

    return this.getGroupById(groupId, userId);
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    memberUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.ensureAdmin(groupId, userId);

    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId: memberUserId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    membership.role = dto.role as GroupMemberRole;
    await this.groupMembersRepository.save(membership);

    return this.getGroupById(groupId, userId);
  }

  async listMembers(groupId: string, userId: string) {
    await this.ensureMember(groupId, userId);

    const members = await this.groupMembersRepository.find({
      where: { groupId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    return members.map((member) => this.toMemberResponse(member));
  }

  private async ensureMember(groupId: string, userId: string) {
    const groupExists = await this.groupsRepository.findOne({
      where: { id: groupId },
      select: { id: true },
    });

    if (!groupExists) {
      throw new NotFoundException('Group not found');
    }

    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return membership;
  }

  private async ensureAdmin(groupId: string, userId: string) {
    const membership = await this.ensureMember(groupId, userId);

    if (membership.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage this group');
    }

    return membership;
  }

  private toGroupResponse(group: Group, myRole: GroupMemberRole) {
    return {
      ...this.toGroupSummary(group),
      myRole,
      members: group.members.map((member) => this.toMemberResponse(member)),
    };
  }

  private toGroupSummary(group: Group): GroupSummary {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatarUrl: group.avatarUrl,
      createdById: group.createdById,
      createdBy: this.toPublicUser(group.createdBy),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  private toMemberResponse(member: GroupMember) {
    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: this.toPublicUser(member.user),
    };
  }

  private toPublicUser(user?: User | null): PublicUser | null {
    if (!user) {
      return null;
    }

    const {
      id,
      username,
      displayName,
      avatarUrl,
      coverPhotoUrl,
      bio,
      createdAt,
    } = user;

    return {
      id,
      username,
      displayName,
      avatarUrl,
      coverPhotoUrl,
      bio,
      createdAt,
    };
  }

  private normalizeLimit(limit?: number) {
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      return DEFAULT_GROUPS_QUERY_LIMIT;
    }

    return Math.min(
      MAX_GROUPS_QUERY_LIMIT,
      Math.max(1, Math.trunc(limit)),
    );
  }

  private encodeCursor(membership: Pick<GroupMember, 'joinedAt' | 'id'>) {
    return Buffer.from(
      JSON.stringify({
        joinedAt: membership.joinedAt.toISOString(),
        id: membership.id,
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
      ) as Partial<GroupCursor>;

      if (
        typeof parsed.joinedAt !== 'string' ||
        Number.isNaN(Date.parse(parsed.joinedAt)) ||
        typeof parsed.id !== 'string' ||
        !parsed.id
      ) {
        throw new Error('Invalid cursor');
      }

      return {
        joinedAt: new Date(parsed.joinedAt).toISOString(),
        id: parsed.id,
      };
    } catch {
      throw new BadRequestException('Invalid before cursor');
    }
  }
}
