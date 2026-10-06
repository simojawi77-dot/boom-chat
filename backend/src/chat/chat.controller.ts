import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groupsAuthorizationService: GroupsAuthorizationService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('messages')
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMessageDto,
  ) {
    if (dto.groupId) {
      // Same authorization the socket gateway enforces; without this the REST
      // path would let any user write into any group.
      await this.groupsAuthorizationService.assertMember(
        req.user.userId,
        dto.groupId,
      );
    }

    const message = await this.chatService.saveMessage(
      req.user.userId,
      dto.content,
      dto.receiverId,
      dto.groupId,
    );

    this.chatGateway.emitNewMessage(message);

    return message;
  }

  @Get('conversation/:userId')
  getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('userId') otherUserId: string,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.chatService.getConversation(
      req.user.userId,
      otherUserId,
      query,
    );
  }

  @Get('group/:groupId')
  async getGroupMessages(
    @Req() req: AuthenticatedRequest,
    @Param('groupId') groupId: string,
    @Query() query: ListMessagesQueryDto,
  ) {
    await this.groupsAuthorizationService.assertMember(
      req.user.userId,
      groupId,
    );
    return this.chatService.getGroupMessages(groupId, query);
  }
}
