import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ForbiddenException, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // tighten this to your frontend URL in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly sendMessageWindowMs = 10_000;
  private readonly sendMessageLimit = 5;

  // userId -> socketId, keeps track of who's online
  private onlineUsers = new Map<string, string>();
  private readonly messageTimestamps = new Map<string, number[]>();

  constructor(
    private readonly chatService: ChatService,
    private readonly groupsAuthorizationService: GroupsAuthorizationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      client.userId = payload.sub;
      this.onlineUsers.set(payload.sub, client.id);
      client.join(payload.sub); // personal room, makes targeted emits simple

      this.logger.log(`User ${payload.sub} connected`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);
      this.messageTimestamps.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: CreateMessageDto,
  ) {
    if (!client.userId) return;

    if (!dto.groupId && !dto.receiverId) {
      return;
    }

    if (dto.groupId) {
      await this.assertGroupMemberOrThrow(client.userId, dto.groupId);
    }

    this.enforceRateLimit(client.userId);

    const message = await this.chatService.saveMessage(
      client.userId,
      this.sanitizeMessageContent(dto.content),
      dto.receiverId ?? null,
      dto.groupId ?? null,
    );

    if (dto.groupId) {
      this.server.to(`group:${dto.groupId}`).emit('newMessage', message);
    } else if (dto.receiverId) {
      this.server.to(dto.receiverId).emit('newMessage', message);
    }

    client.emit('messageSent', message);

    return message;
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string },
  ) {
    if (!client.userId) return;
    await this.assertGroupMemberOrThrow(client.userId, data.groupId);
    client.join(`group:${data.groupId}`);
    return { groupId: data.groupId };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId?: string; groupId?: string },
  ) {
    if (!client.userId) return;

    if (data.groupId) {
      this.server.to(`group:${data.groupId}`).emit('userTyping', {
        userId: client.userId,
        groupId: data.groupId,
      });
      return;
    }

    if (data.receiverId) {
      this.server.to(data.receiverId).emit('userTyping', {
        userId: client.userId,
      });
    }
  }

  private enforceRateLimit(userId: string) {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(userId) ?? [];
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.sendMessageWindowMs,
    );

    if (recentTimestamps.length >= this.sendMessageLimit) {
      this.logger.warn(`Rate limit exceeded userId=${userId}`);
      throw new WsException('Too many requests');
    }

    recentTimestamps.push(now);
    this.messageTimestamps.set(userId, recentTimestamps);
  }

  private sanitizeMessageContent(content: string) {
    return content.replace(/\u0000/g, '').trim();
  }

  private async assertGroupMemberOrThrow(userId: string, groupId: string) {
    try {
      await this.groupsAuthorizationService.assertMember(userId, groupId);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new WsException('Forbidden');
      }

      throw error;
    }
  }
}
