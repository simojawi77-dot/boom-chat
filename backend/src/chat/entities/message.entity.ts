import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  senderId: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  receiverId?: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  groupId?: string | null;

  @Column({ type: 'varchar', default: 'direct' })
  conversationType: 'direct' | 'group';

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
