import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  DEFAULT_CHAT_MESSAGE_LIMIT,
  ListMessagesQueryDto,
  MAX_CHAT_MESSAGE_LIMIT,
} from './list-messages-query.dto';

describe('ListMessagesQueryDto', () => {
  it('uses the default limit when limit is omitted', () => {
    const dto = plainToInstance(ListMessagesQueryDto, {});

    expect(dto.limit).toBe(DEFAULT_CHAT_MESSAGE_LIMIT);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('accepts a custom limit within range', () => {
    const dto = plainToInstance(ListMessagesQueryDto, { limit: '25' });

    expect(dto.limit).toBe(25);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('accepts the maximum limit', () => {
    const dto = plainToInstance(ListMessagesQueryDto, {
      limit: String(MAX_CHAT_MESSAGE_LIMIT),
    });

    expect(dto.limit).toBe(MAX_CHAT_MESSAGE_LIMIT);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects invalid limits', () => {
    const dto = plainToInstance(ListMessagesQueryDto, { limit: 'abc' });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
