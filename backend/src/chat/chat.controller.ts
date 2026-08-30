import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groupsAuthorizationService: GroupsAuthorizationService,
  ) {}

  @Post('messages')
  sendMessage(@Req() req: AuthenticatedRequest, @Body() dto: CreateMessageDto) {
    return this.chatService.saveMessage(req.user.userId, dto.content, dto.receiverId, dto.groupId);
  }

  @Get('conversation/:userId')
  getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getConversation(req.user.userId, otherUserId);
  }

  @Get('group/:groupId')
  async getGroupMessages(
    @Req() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
  ) {
    await this.groupsAuthorizationService.assertMember(req.user.userId, groupId);
    return this.chatService.getGroupMessages(groupId);
  }
}
