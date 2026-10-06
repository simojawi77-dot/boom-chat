import { GroupsService } from './groups.service';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Group } from './entities/group.entity';

type GroupsRepositoryMock = jest.Mocked<
  Pick<Repository<Group>, 'create' | 'save' | 'findOne' | 'update' | 'delete'>
>;
type GroupMembersRepositoryMock = jest.Mocked<
  Pick<
    Repository<GroupMember>,
    'create' | 'save' | 'find' | 'findOne' | 'remove'
  >
>;

describe('GroupsService', () => {
  let service: GroupsService;
  let groupsRepository: GroupsRepositoryMock;
  let groupMembersRepository: GroupMembersRepositoryMock;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    groupsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    groupMembersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    usersService = {
      findById: jest.fn(),
    };

    service = new GroupsService(
      groupsRepository as unknown as Repository<Group>,
      groupMembersRepository as unknown as Repository<GroupMember>,
      usersService as UsersService,
    );
  });

  it('creates a group and adds the creator as admin', async () => {
    const createdGroup = {
      id: 'group-1',
      name: 'Dev Team',
      createdById: 'user-1',
    };
    groupsRepository.create.mockReturnValue(createdGroup);
    groupsRepository.save.mockResolvedValue(createdGroup);
    groupMembersRepository.create.mockReturnValue({
      groupId: 'group-1',
      userId: 'user-1',
      role: 'admin',
    });
    groupMembersRepository.save.mockResolvedValue(undefined);
    groupsRepository.findOne.mockResolvedValue({
      ...createdGroup,
      createdBy: null,
      members: [{ userId: 'user-1', role: 'admin' }],
    });
    groupMembersRepository.findOne.mockResolvedValue({ role: 'admin' });

    const result = await service.createGroup('user-1', { name: 'Dev Team' });

    expect(groupsRepository.create).toHaveBeenCalledWith({
      name: 'Dev Team',
      createdById: 'user-1',
    });
    expect(groupMembersRepository.create).toHaveBeenCalledWith({
      groupId: 'group-1',
      userId: 'user-1',
      role: 'admin',
    });
    expect(result).toMatchObject({ id: 'group-1', myRole: 'admin' });
  });
});
