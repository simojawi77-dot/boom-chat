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

  it('returns group messages for a member', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockResolvedValue({
      userId: 'user-1',
    });
    (chatService.getGroupMessages as jest.Mock).mockResolvedValue([{ id: 'msg-1' }]);

    const result = await controller.getGroupMessages(
      { user: { userId: 'user-1', username: 'alice' } } as any,
      'group-1',
    );

    expect(groupsAuthorizationService.assertMember).toHaveBeenCalledWith(
      'user-1',
      'group-1',
    );
    expect(chatService.getGroupMessages).toHaveBeenCalledWith('group-1');
    expect(result).toEqual([{ id: 'msg-1' }]);
  });

  it('rejects non-members with forbidden', async () => {
    (groupsAuthorizationService.assertMember as jest.Mock).mockRejectedValue(
      new ForbiddenException('Forbidden'),
    );

    await expect(
      controller.getGroupMessages(
        { user: { userId: 'user-1', username: 'alice' } } as any,
        'group-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(chatService.getGroupMessages).not.toHaveBeenCalled();
  });
});
