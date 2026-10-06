import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Message } from '../chat/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Group, GroupMember, Message, Post],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
