import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { GroupsAuthorizationService } from './groups-authorization.service';

type FindOne = Repository<GroupMember>['findOne'];
type GroupMembersRepositoryMock = {
  findOne: jest.MockedFunction<FindOne>;
};

describe('GroupsAuthorizationService', () => {
  let service: GroupsAuthorizationService;
  let groupMembersRepository: GroupMembersRepositoryMock;

  beforeEach(() => {
    groupMembersRepository = {
      findOne: jest.fn<ReturnType<FindOne>, Parameters<FindOne>>(),
    };

    service = new GroupsAuthorizationService(
      groupMembersRepository as unknown as Repository<GroupMember>,
    );
  });

  it('allows a member to access a group', async () => {
    groupMembersRepository.findOne.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'member',
      group: { id: 'group-1' },
    });

    await expect(
      service.assertMember('user-1', 'group-1'),
    ).resolves.toMatchObject({
      userId: 'user-1',
      groupId: 'group-1',
    });
  });

  it('rejects a non-member', async () => {
    groupMembersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.assertMember('user-1', 'group-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
