import { ForbiddenException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: Partial<ChatService>;
  let groupsAuthorizationService: Partial<GroupsAuthorizationService>;
  let server: { to: jest.Mock };

  beforeEach(() => {
    chatService = {
      saveMessage: jest.fn(),
    };

    groupsAuthorizationService = {
      assertMember: jest.fn(),
    };

    gateway = new ChatGateway(
      chatService as ChatService,
      groupsAuthorizationService as GroupsAuthorizationService,
      {
        verifyAsync: jest.fn(),
      } as JwtService,
      {
        get: jest.fn().mockReturnValue('test-secret'),
      } as ConfigService,
    );

    server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    gateway.server = server as any;
  });

  it('allows a member to join a group room', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockResolvedValue({
      userId: 'user-1',
    });

    const client = {
      userId: 'user-1',
      join: jest.fn(),
    } as any;

    const result = await gateway.handleJoinGroup(client, { groupId: 'group-1' });

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(client.join).toHaveBeenCalledWith('group:group-1');
    expect(result).toEqual({ groupId: 'group-1' });
  });

  it('rejects non-members from joining a group room', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    const client = {
      userId: 'user-1',
      join: jest.fn(),
    } as any;

    await expect(gateway.handleJoinGroup(client, { groupId: 'group-1' })).rejects.toBeInstanceOf(
      WsException,
    );

    expect(client.join).not.toHaveBeenCalled();
  });

  it('sends a sanitized group message for a member', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockResolvedValue({
      userId: 'user-1',
    });
    (chatService.saveMessage as jest.Mock).mockResolvedValue({
      id: 'message-1',
      content: 'hello',
    });

    const emit = jest.fn();
    server.to.mockReturnValue({ emit });

    const client = {
      userId: 'user-1',
      emit: jest.fn(),
    } as any;

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
    expect(emit).toHaveBeenCalledWith('newMessage', { id: 'message-1', content: 'hello' });
    expect(client.emit).toHaveBeenCalledWith('messageSent', {
      id: 'message-1',
      content: 'hello',
    });
    expect(result).toEqual({ id: 'message-1', content: 'hello' });
  });

  it('rejects non-members from sending a group message', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    const client = {
      userId: 'user-1',
      emit: jest.fn(),
    } as any;

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
