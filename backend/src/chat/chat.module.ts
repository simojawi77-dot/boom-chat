import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Message } from './entities/message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
