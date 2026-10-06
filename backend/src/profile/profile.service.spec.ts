import { ProfileService } from './profile.service';
import { UsersService } from '../users/users.service';

describe('ProfileService', () => {
  it('normalizes empty profile fields before saving', async () => {
    const updateProfile = jest.fn().mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      displayName: null,
      avatarUrl: null,
      coverPhotoUrl: null,
      bio: null,
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      firstName: 'Alice',
      lastName: 'Doe',
      city: 'Rabat',
    });

    const service = new ProfileService({
      updateProfile,
    } as unknown as UsersService);

    await service.updateMyProfile('user-1', {
      displayName: '   ',
      bio: '  Hello world  ',
    });

    expect(updateProfile).toHaveBeenCalledWith('user-1', {
      displayName: null,
      bio: 'Hello world',
    });
  });
});
