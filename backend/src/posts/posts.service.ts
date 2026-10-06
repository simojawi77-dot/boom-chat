import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

type PostCursor = { createdAt: string; id: string };

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private readonly posts: Repository<Post>) {}

  async create(userId: string, dto: CreatePostDto) {
    const content = this.normalizeContent(dto.content);
    const post = await this.posts.save(this.posts.create({ userId, content }));
    return this.toResponse(
      await this.posts.findOneOrFail({ where: { id: post.id }, relations: ['user'] }),
    );
  }

  async list(query: ListPostsQueryDto = new ListPostsQueryDto()) {
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const cursor = this.decodeCursor(query.before);
    const builder = this.posts
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC');

    if (cursor) {
      builder.where(
        '(post.createdAt < :beforeCreatedAt OR (post.createdAt = :beforeCreatedAt AND post.id < :beforeId))',
        { beforeCreatedAt: cursor.createdAt, beforeId: cursor.id },
      );
    }

    const rows = await builder.take(limit + 1).getMany();
    const items = rows.slice(0, limit);
    const hasMore = rows.length > limit;
    return {
      items: items.map((post) => this.toResponse(post)),
      hasMore,
      nextCursor: hasMore ? this.encodeCursor(items[items.length - 1]) : null,
    };
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.findOwned(id, userId);
    if (dto.content !== undefined) post.content = this.normalizeContent(dto.content);
    return this.toResponse(await this.posts.save(post));
  }

  async remove(id: string, userId: string) {
    const post = await this.findOwned(id, userId);
    await this.posts.remove(post);
    return { success: true };
  }

  private async findOwned(id: string, userId: string) {
    const post = await this.posts.findOne({ where: { id }, relations: ['user'] });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('You can only manage your own posts');
    return post;
  }

  private normalizeContent(content: string) {
    const normalized = content.trim();
    if (!normalized) throw new BadRequestException('Post content cannot be empty');
    return normalized;
  }

  private toResponse(post: Post) {
    const user = post.user
      ? {
          id: post.user.id,
          username: post.user.username,
          displayName: post.user.displayName,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          city: post.user.city,
          avatarUrl: post.user.avatarUrl,
          bio: post.user.bio,
        }
      : null;
    return { id: post.id, content: post.content, createdAt: post.createdAt, updatedAt: post.updatedAt, user };
  }

  private encodeCursor(post: Post) {
    return Buffer.from(JSON.stringify({ createdAt: post.createdAt.toISOString(), id: post.id })).toString('base64url');
  }

  private decodeCursor(value?: string): PostCursor | null {
    if (!value) return null;
    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<PostCursor>;
      if (!parsed.createdAt || Number.isNaN(Date.parse(parsed.createdAt)) || !parsed.id) throw new Error();
      return { createdAt: new Date(parsed.createdAt).toISOString(), id: parsed.id };
    } catch {
      throw new BadRequestException('Invalid before cursor');
    }
  }
}
