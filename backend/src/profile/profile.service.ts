import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getMyProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.toOwnProfile(user);
  }

  async getPublicProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublicProfile(user);
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return this.toOwnProfile(user);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.usersService.updateProfile(userId, { avatarUrl });
    return this.toOwnProfile(user);
  }

  async updateCoverPhoto(userId: string, coverPhotoUrl: string) {
    const user = await this.usersService.updateProfile(userId, {
      coverPhotoUrl,
    });
    return this.toOwnProfile(user);
  }

  private toOwnProfile(user: User) {
    const {
      id,
      username,
      email,
      displayName,
      avatarUrl,
      coverPhotoUrl,
      bio,
      createdAt,
      firstName,
      lastName,
      city,
    } = user;
    return {
      id,
      username,
      email,
      displayName,
      avatarUrl,
      coverPhotoUrl,
      bio,
      createdAt,
      firstName,
      lastName,
      city,
    };
  }

  private toPublicProfile(user: User) {
    const { id, username, displayName, avatarUrl, coverPhotoUrl, bio } = user;
    return { id, username, displayName, avatarUrl, coverPhotoUrl, bio };
  }
}
