import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const DEFAULT_GROUPS_QUERY_LIMIT = 50;
export const MAX_GROUPS_QUERY_LIMIT = 100;

export class ListGroupsQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? DEFAULT_GROUPS_QUERY_LIMIT : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_GROUPS_QUERY_LIMIT)
  limit = DEFAULT_GROUPS_QUERY_LIMIT;

  @IsOptional()
  @IsString()
  before?: string;
}
