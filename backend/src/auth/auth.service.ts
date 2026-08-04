import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const tokens = await this.issueTokens(user.id, user.username);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.username);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Access denied');

    // Rotation: issue a brand new pair and invalidate the old refresh token
    const tokens = await this.issueTokens(user.id, user.username);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  private async issueTokens(userId: string, username: string): Promise<Tokens> {
    const payload = { sub: userId, username };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        '15m',
      ) as unknown as number,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as unknown as number,
    });

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(userId, hash);
  }

  private sanitize(user: {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    const { id, username, email, displayName, avatarUrl } = user;
    return { id, username, email, displayName, avatarUrl };
  }
}
