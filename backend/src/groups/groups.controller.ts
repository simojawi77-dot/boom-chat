import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { GroupsService } from './groups.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  createGroup(@Req() req: AuthenticatedRequest, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(req.user.userId, dto);
  }

  @Get()
  getMyGroups(@Req() req: AuthenticatedRequest) {
    return this.groupsService.getUserGroups(req.user.userId);
  }

  @Get(':id')
  getGroup(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.groupsService.getGroupById(id, req.user.userId);
  }

  @Patch(':id')
  updateGroup(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(id, req.user.userId, dto);
  }

  @Delete(':id')
  deleteGroup(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.groupsService.deleteGroup(id, req.user.userId);
  }

  @Post(':id/members')
  addMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.groupsService.addMember(id, req.user.userId, dto);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.groupsService.updateMemberRole(id, req.user.userId, userId, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.groupsService.removeMember(id, req.user.userId, userId);
  }

  @Get(':id/members')
  listMembers(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.groupsService.listMembers(id, req.user.userId);
  }
}
