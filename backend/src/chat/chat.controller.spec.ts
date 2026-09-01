import { ForbiddenException } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GroupsAuthorizationService } from '../groups/groups-authorization.service';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: Partial<ChatService>;
  let groupsAuthorizationService: Partial<GroupsAuthorizationService>;

  beforeEach(() => {
    chatService = {
      getConversation: jest.fn(),
      getGroupMessages: jest.fn(),
    };

    groupsAuthorizationService = {
      assertMember: jest.fn(),
    };

    controller = new ChatController(
      chatService as ChatService,
      groupsAuthorizationService as GroupsAuthorizationService,
    );
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
