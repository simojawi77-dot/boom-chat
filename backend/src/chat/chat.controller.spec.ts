import { ForbiddenException } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';
import { Message } from './entities/message.entity';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: Partial<ChatService>;
  let groupsAuthorizationService: Partial<GroupsAuthorizationService>;
  let chatGateway: { emitNewMessage: jest.Mock };

  beforeEach(() => {
    chatService = {
      saveMessage: jest.fn(),
      getConversation: jest.fn(),
      getGroupMessages: jest.fn(),
    };

    groupsAuthorizationService = {
      assertMember: jest.fn(),
    };

    chatGateway = {
      emitNewMessage: jest.fn(),
    };

    controller = new ChatController(
      chatService as ChatService,
      groupsAuthorizationService as GroupsAuthorizationService,
      chatGateway as unknown as ChatGateway,
    );
  });

  it('saves a direct message and emits it in real time', async () => {
    const saved = { id: 'msg-1' } as Message;
    (chatService.saveMessage as jest.Mock).mockResolvedValue(saved);

    const result = await controller.sendMessage(
      {
        user: { userId: 'user-1', username: 'alice' },
      } as unknown as Parameters<ChatController['sendMessage']>[0],
      { receiverId: 'user-2', content: 'hello' },
    );

    expect(chatService.saveMessage).toHaveBeenCalledWith(
      'user-1',
      'hello',
      'user-2',
      undefined,
    );
    expect(chatGateway.emitNewMessage).toHaveBeenCalledWith(saved);
    expect(result).toBe(saved);
  });

  it('rejects non-members from sending group messages via REST', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    await expect(
      controller.sendMessage(
        {
          user: { userId: 'user-1', username: 'alice' },
        } as unknown as Parameters<ChatController['sendMessage']>[0],
        { groupId: 'group-1', content: 'intruder message' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(chatService.saveMessage).not.toHaveBeenCalled();
    expect(chatGateway.emitNewMessage).not.toHaveBeenCalled();
  });

  it('saves and emits a group message for a member', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockResolvedValue({
      userId: 'user-1',
    });
    const saved = { id: 'msg-2', groupId: 'group-1' } as Message;
    (chatService.saveMessage as jest.Mock).mockResolvedValue(saved);

    const result = await controller.sendMessage(
      {
        user: { userId: 'user-1', username: 'alice' },
      } as unknown as Parameters<ChatController['sendMessage']>[0],
      { groupId: 'group-1', content: 'hello group' },
    );

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(chatGateway.emitNewMessage).toHaveBeenCalledWith(saved);
    expect(result).toBe(saved);
  });

  it('does not check group membership for direct messages', async () => {
    const saved = { id: 'msg-3' } as Message;
    (chatService.saveMessage as jest.Mock).mockResolvedValue(saved);

    await controller.sendMessage(
      {
        user: { userId: 'user-1', username: 'alice' },
      } as unknown as Parameters<ChatController['sendMessage']>[0],
      { receiverId: 'user-2', content: 'hello' },
    );

    expect(groupsAuthorizationService.assertMember).not.toHaveBeenCalled();
  });

  it('forwards conversation pagination query params to the service', async () => {
    const response = {
      items: [{ id: 'msg-1' }],
      nextCursor: null,
      hasMore: false,
    };
    (chatService.getConversation as jest.Mock).mockResolvedValue(response);

    const result = await controller.getConversation(
      {
        user: { userId: 'user-1', username: 'alice' },
      } as unknown as Parameters<ChatController['getConversation']>[0],
      'user-2',
      { limit: 25, before: 'cursor-value' },
    );

    expect(chatService.getConversation).toHaveBeenCalledWith(
      'user-1',
      'user-2',
      {
        limit: 25,
        before: 'cursor-value',
      },
    );
    expect(result).toEqual(response);
  });

  it('returns paginated group messages for a member', async () => {
    const response = {
      items: [{ id: 'msg-1' }],
      nextCursor: null,
      hasMore: false,
    };
    (groupsAuthorizationService.assertMember as jest.Mock).mockResolvedValue({
      userId: 'user-1',
    });
    (chatService.getGroupMessages as jest.Mock).mockResolvedValue(response);

    const result = await controller.getGroupMessages(
      {
        user: { userId: 'user-1', username: 'alice' },
      } as unknown as Parameters<ChatController['getGroupMessages']>[0],
      'group-1',
      { limit: 25, before: 'cursor-value' },
    );

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(chatService.getGroupMessages).toHaveBeenCalledWith('group-1', {
      limit: 25,
      before: 'cursor-value',
    });
    expect(result).toEqual(response);
  });

  it('rejects non-members with forbidden', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    await expect(
      controller.getGroupMessages(
        {
          user: { userId: 'user-1', username: 'alice' },
        } as unknown as Parameters<ChatController['getGroupMessages']>[0],
        'group-1',
        { limit: 25 },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(chatService.getGroupMessages).not.toHaveBeenCalled();
  });
});
