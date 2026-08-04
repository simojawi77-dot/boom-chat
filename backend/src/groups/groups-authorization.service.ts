import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';

@Injectable()
export class GroupsAuthorizationService {
  private readonly logger = new Logger(GroupsAuthorizationService.name);

  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
  ) {}

  async assertMember(userId: string, groupId: string): Promise<GroupMember> {
    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
      relations: ['group'],
    });

    if (!membership || !membership.group) {
      this.logDenied(userId, groupId, 'not_member_or_inactive');
      throw new ForbiddenException('Forbidden');
    }

    return membership;
  }

  async assertAdmin(userId: string, groupId: string): Promise<GroupMember> {
    const membership = await this.assertMember(userId, groupId);

    if (membership.role !== 'admin') {
      this.logDenied(userId, groupId, 'not_admin');
      throw new ForbiddenException('Forbidden');
    }

    return membership;
  }

  private logDenied(userId: string, groupId: string, reason: string) {
    this.logger.warn(
      `Unauthorized group access attempt userId=${userId} groupId=${groupId} reason=${reason}`,
    );
  }
}
