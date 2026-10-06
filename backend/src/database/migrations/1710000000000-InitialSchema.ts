import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'username', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'passwordHash', type: 'varchar' },
          { name: 'firstName', type: 'varchar', isNullable: true },
          { name: 'lastName', type: 'varchar', isNullable: true },
          { name: 'gender', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar', isNullable: true },
          { name: 'dateOfBirth', type: 'date', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'displayName', type: 'varchar', isNullable: true },
          { name: 'avatarUrl', type: 'varchar', isNullable: true },
          { name: 'coverPhotoUrl', type: 'varchar', isNullable: true },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'refreshTokenHash', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_fe0bb3f6520ee0469504521e710',
            columnNames: ['username'],
          }),
          new TableUnique({
            name: 'UQ_97672ac88f789774dd47f7c8be3',
            columnNames: ['email'],
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'avatarUrl', type: 'varchar', isNullable: true },
          { name: 'createdById', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_e0522c4be8bab20520896919da0',
            columnNames: ['createdById'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'group_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'groupId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'role', type: 'varchar', default: "'member'" },
          { name: 'joinedAt', type: 'timestamp', default: 'now()' },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_53f644f66a416c1542b743c0295',
            columnNames: ['groupId', 'userId'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_1aa8d31831c3126947e7a713c2b',
            columnNames: ['groupId'],
            referencedTableName: 'groups',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_fdef099303bcf0ffd9a4a7b18f5',
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'senderId', type: 'varchar' },
          { name: 'receiverId', type: 'varchar', isNullable: true },
          { name: 'groupId', type: 'varchar', isNullable: true },
          { name: 'conversationType', type: 'varchar', default: "'direct'" },
          { name: 'content', type: 'text' },
          { name: 'isRead', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_2db9cf2b3ca111742793f6c37c',
            columnNames: ['senderId'],
          }),
          new TableIndex({
            name: 'IDX_acf951a58e3b9611dd96ce8904',
            columnNames: ['receiverId'],
          }),
          new TableIndex({
            name: 'IDX_438f09ab5b4bbcd27683eac2a5',
            columnNames: ['groupId'],
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages', true);
    await queryRunner.dropTable('group_members', true);
    await queryRunner.dropTable('groups', true);
    await queryRunner.dropTable('users', true);
  }
}
