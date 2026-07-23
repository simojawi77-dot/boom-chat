import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation/:userId')
  getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getConversation(req.user.userId, otherUserId);
  }
}
