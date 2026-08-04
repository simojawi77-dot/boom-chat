import { ForbiddenException } from '@nestjs/common';
import { GroupsAuthorizationService } from './groups-authorization.service';

describe('GroupsAuthorizationService', () => {
  let service: GroupsAuthorizationService;
  let groupMembersRepository: any;

  beforeEach(() => {
    groupMembersRepository = {
      findOne: jest.fn(),
    };

    service = new GroupsAuthorizationService(groupMembersRepository as any);
  });

  it('allows a member to access a group', async () => {
    groupMembersRepository.findOne.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'member',
      group: { id: 'group-1' },
    });

    await expect(service.assertMember('user-1', 'group-1')).resolves.toMatchObject({
      userId: 'user-1',
      groupId: 'group-1',
    });
  });

  it('rejects a non-member', async () => {
    groupMembersRepository.findOne.mockResolvedValue(null);

    await expect(service.assertMember('user-1', 'group-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
