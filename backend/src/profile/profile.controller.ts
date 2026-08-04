import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getMyProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(req.user.userId, dto);
  }

  @Get(':userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.profileService.getPublicProfile(userId);
  }
}
