import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService, Tokens } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthService refresh-token security', () => {
  function createService() {
    const storedUser = {
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: '',
      refreshTokenHash: null as string | null,
    };
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(storedUser),
      findById: jest.fn().mockImplementation(async () => storedUser),
      setRefreshTokenHash: jest.fn().mockImplementation(
        async (_userId: string, hash: string | null) => {
          storedUser.refreshTokenHash = hash;
        },
      ),
    };
    const jwtService = {
      signAsync: jest
        .fn<(...args: unknown[]) => Promise<string>>()
        .mockResolvedValueOnce('access-token-1')
        .mockResolvedValueOnce('refresh-token-1')
        .mockResolvedValueOnce('access-token-2')
        .mockResolvedValueOnce('refresh-token-2'),
    };
    const configService = {
      get: jest.fn((name: string, fallback?: string) =>
        name === 'JWT_ACCESS_SECRET'
          ? 'access-test-secret'
          : name === 'JWT_REFRESH_SECRET'
            ? 'refresh-test-secret'
            : fallback,
      ),
    };

    const service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    return { service, storedUser, usersService, jwtService };
  }

  it('stores a SHA-256 digest before bcrypt and rejects a rotated-out token', async () => {
    const { service, storedUser, usersService } = createService();
    storedUser.passwordHash = await bcrypt.hash('password', 4);

    const firstTokens = await service.login({
      email: 'alice@example.com',
      password: 'password',
    });
    const firstHash = storedUser.refreshTokenHash;

    expect(firstHash).toEqual(expect.any(String));
    expect(await bcrypt.compare('refresh-token-1', firstHash!)).toBe(false);
    expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
      'user-1',
      firstHash,
    );

    await service.refresh('user-1', firstTokens.refreshToken);
    const secondHash = storedUser.refreshTokenHash;

    expect(secondHash).toEqual(expect.any(String));
    await expect(
      service.refresh('user-1', firstTokens.refreshToken),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects the active refresh token after logout revokes its hash', async () => {
    const { service, storedUser } = createService();
    storedUser.passwordHash = await bcrypt.hash('password', 4);

    const tokens: Tokens = await service.login({
      email: 'alice@example.com',
      password: 'password',
    });
    await service.logout('user-1');

    expect(storedUser.refreshTokenHash).toBeNull();
    await expect(service.refresh('user-1', tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns the full user snapshot on login and refresh so the frontend can restore auth state', async () => {
    const { service, storedUser } = createService();
    storedUser.passwordHash = await bcrypt.hash('password', 4);
    storedUser.displayName = 'Alice Carter';
    storedUser.firstName = 'Alice';
    storedUser.lastName = 'Carter';
    storedUser.city = 'Casablanca';
    storedUser.avatarUrl = 'https://cdn.example.com/avatar.png';
    storedUser.coverPhotoUrl = 'https://cdn.example.com/cover.png';
    storedUser.bio = 'Product designer';

    const loginResult = await service.login({
      email: 'alice@example.com',
      password: 'password',
    });

    expect(loginResult.user).toMatchObject({
      id: 'user-1',
      username: 'alice',
      displayName: 'Alice Carter',
      firstName: 'Alice',
      lastName: 'Carter',
      city: 'Casablanca',
      avatarUrl: 'https://cdn.example.com/avatar.png',
      coverPhotoUrl: 'https://cdn.example.com/cover.png',
      bio: 'Product designer',
    });

    const refreshResult = await service.refresh('user-1', loginResult.refreshToken);

    expect(refreshResult).toMatchObject({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
      user: expect.objectContaining({
        id: 'user-1',
        username: 'alice',
        bio: 'Product designer',
      }),
    });
  });
});
