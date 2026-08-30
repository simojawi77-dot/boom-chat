import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
interface AuthenticatedRequest extends Request { user: { userId: string } }
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  list(@Req() req: AuthenticatedRequest, @Query('q') query = '') { return this.usersService.listPublic(query, req.user.userId); }
}
