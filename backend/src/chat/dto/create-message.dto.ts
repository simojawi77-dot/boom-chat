import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsString()
  @MinLength(1)
  content: string;
}
