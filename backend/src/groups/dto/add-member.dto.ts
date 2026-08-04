import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsIn(['admin', 'member'])
  role?: 'admin' | 'member';
}
