import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const DEFAULT_CHAT_MESSAGE_LIMIT = 50;
export const MAX_CHAT_MESSAGE_LIMIT = 100;

export class ListMessagesQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? DEFAULT_CHAT_MESSAGE_LIMIT : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_CHAT_MESSAGE_LIMIT)
  limit = DEFAULT_CHAT_MESSAGE_LIMIT;

  @IsOptional()
  @IsString()
  before?: string;
}
