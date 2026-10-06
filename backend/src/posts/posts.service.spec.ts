import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

describe('PostsService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    remove: jest.fn(),
  } as any;
  let service: PostsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PostsService(repository);
  });

  it('creates a post for the authenticated user and returns a public author', async () => {
    const entity = { id: 'post-1', userId: 'user-a', content: 'Hello' } as Post;
    repository.create.mockReturnValue(entity);
    repository.save.mockResolvedValue(entity);
    repository.findOneOrFail.mockResolvedValue({
      ...entity,
      user: { id: 'user-a', username: 'alice', passwordHash: 'hidden', refreshTokenHash: 'hidden' },
    });

    const result = await service.create('user-a', { content: '  Hello  ' });

    expect(repository.create).toHaveBeenCalledWith({ userId: 'user-a', content: 'Hello' });
    expect(result).toEqual(expect.objectContaining({ id: 'post-1', content: 'Hello' }));
    expect(result.user).toEqual(expect.objectContaining({ id: 'user-a', username: 'alice' }));
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user).not.toHaveProperty('refreshTokenHash');
  });

  it('rejects managing another user post', async () => {
    repository.findOne.mockResolvedValue({ id: 'post-1', userId: 'user-a' });

    await expect(service.remove('post-1', 'user-b')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('returns not found when deleting a missing post', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing', 'user-a')).rejects.toBeInstanceOf(NotFoundException);
  });
});
