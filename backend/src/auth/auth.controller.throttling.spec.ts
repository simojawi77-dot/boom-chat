import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController throttling', () => {
  let app: INestApplication;
  const authService = {
    login: jest.fn().mockResolvedValue({
      user: { username: 'alice' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 1000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows normal login requests and returns 429 after the configured limit', async () => {
    for (let index = 0; index < 5; index += 1) {
      await request(app.getHttpServer() as never)
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'secret' })
        .expect(201);
    }

    await request(app.getHttpServer() as never)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'secret' })
      .expect(429);

    expect(authService.login).toHaveBeenCalledTimes(5);
  });
});
