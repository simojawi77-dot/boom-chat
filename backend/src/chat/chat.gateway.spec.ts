import { ForbiddenException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Message } from './entities/message.entity';
import { Server, Socket } from 'socket.io';

type ChatServiceMock = {
  saveMessage: jest.MockedFunction<
    (
      senderId: string,
      content: string,
      receiverId?: string | null,
      groupId?: string | null,
    ) => Promise<Pick<Message, 'id' | 'content'>>
  >;
};
type GroupsAuthorizationServiceMock = {
  assertMember: jest.MockedFunction<
    (userId: string, groupId: string) => Promise<Pick<GroupMember, 'userId'>>
  >;
};
type TestEmit = jest.MockedFunction<
  (event: string, ...args: unknown[]) => void
>;
type TestServer = {
  to: jest.MockedFunction<(room: string) => { emit: TestEmit }>;
};
type TestClient = Socket & { userId?: string };

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatServiceMock;
  let groupsAuthorizationService: GroupsAuthorizationServiceMock;
  let server: TestServer;

  beforeEach(() => {
    chatService = {
      saveMessage: jest.fn(),
    };

    groupsAuthorizationService = {
      assertMember: jest.fn(),
    };

    gateway = new ChatGateway(
      chatService as unknown as ChatService,
      groupsAuthorizationService as unknown as GroupsAuthorizationService,
      {
        verifyAsync: jest.fn(),
      } as unknown as JwtService,
      {
        get: jest.fn().mockReturnValue('test-secret'),
      } as unknown as ConfigService,
    );

    server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    gateway.server = server as unknown as Server;
  });

  it('allows a member to join a group room', async () => {
    groupsAuthorizationService.assertMember.mockResolvedValue({
      userId: 'user-1',
    });

    const client = {
      userId: 'user-1',
      join: jest.fn(),
    } as unknown as TestClient;

    const result = await gateway.handleJoinGroup(client, {
      groupId: 'group-1',
    });

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(client.join).toHaveBeenCalledWith('group:group-1');
    expect(result).toEqual({ groupId: 'group-1' });
  });

  it('rejects non-members from joining a group room', async () => {
    groupsAuthorizationService.assertMember.mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    const client = {
      userId: 'user-1',
      join: jest.fn(),
    } as unknown as TestClient;

    await expect(
      gateway.handleJoinGroup(client, { groupId: 'group-1' }),
    ).rejects.toBeInstanceOf(WsException);

    expect(client.join).not.toHaveBeenCalled();
  });

  it('sends a sanitized group message for a member', async () => {
    groupsAuthorizationService.assertMember.mockResolvedValue({
      userId: 'user-1',
    });
    chatService.saveMessage.mockResolvedValue({
      id: 'message-1',
      content: 'hello',
      groupId: 'group-1',
    });

    const emit = jest.fn();
    server.to.mockReturnValue({ emit });

    const client = {
      userId: 'user-1',
      emit: jest.fn(),
    } as unknown as TestClient;

    const result = await gateway.handleMessage(client, {
      groupId: 'group-1',
      content: '  hello\u0000  ',
    });

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(chatService.saveMessage).toHaveBeenCalledWith(
      'user-1',
      'hello',
      null,
      'group-1',
    );
    expect(server.to).toHaveBeenCalledWith('group:group-1');
    expect(emit).toHaveBeenCalledWith('newMessage', {
      id: 'message-1',
      content: 'hello',
      groupId: 'group-1',
    });
    expect(client.emit).toHaveBeenCalledWith('messageSent', {
      id: 'message-1',
      content: 'hello',
      groupId: 'group-1',
    });
    expect(result).toEqual({
      id: 'message-1',
      content: 'hello',
      groupId: 'group-1',
    });
  });

  it('rejects non-members from sending a group message', async () => {
    groupsAuthorizationService.assertMember.mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    const client = {
      userId: 'user-1',
      emit: jest.fn(),
    } as unknown as TestClient;

    await expect(
      gateway.handleMessage(client, {
        groupId: 'group-1',
        content: 'hello',
      }),
    ).rejects.toBeInstanceOf(WsException);

    expect(chatService.saveMessage).not.toHaveBeenCalled();
    expect(server.to).not.toHaveBeenCalled();
    expect(client.emit).not.toHaveBeenCalled();
  });
});
