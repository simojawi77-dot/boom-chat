import {
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

  async getUserGroups(userId: string) {
    const memberships = await this.groupMembersRepository.find({
      where: { userId },
      relations: ['group', 'group.createdBy'],
      order: { joinedAt: 'ASC' },
    });

    return memberships.map((membership) => ({
      ...this.toGroupSummary(membership.group),
      myRole: membership.role,
    }));
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

  private toGroupSummary(group: Group) {
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
}
