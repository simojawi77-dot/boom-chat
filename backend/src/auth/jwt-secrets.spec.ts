import { ConfigService } from '@nestjs/config';
import { getRequiredJwtSecret } from './jwt-secrets';

function config(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((name: string) => values[name]),
  } as unknown as ConfigService;
}

describe('getRequiredJwtSecret', () => {
  it('uses development fallback values when the env vars are missing', () => {
    expect(getRequiredJwtSecret(config({}), 'JWT_ACCESS_SECRET')).toBe(
      'dev_access_secret_change_in_production',
    );
    expect(
      getRequiredJwtSecret(
        config({ JWT_REFRESH_SECRET: '   ' }),
        'JWT_REFRESH_SECRET',
      ),
    ).toBe('dev_refresh_secret_change_in_production');
  });

  it('accepts configured access and refresh secrets independently', () => {
    const service = config({
      JWT_ACCESS_SECRET: 'access-test-secret',
      JWT_REFRESH_SECRET: 'refresh-test-secret',
    });

    expect(getRequiredJwtSecret(service, 'JWT_ACCESS_SECRET')).toBe(
      'access-test-secret',
    );
    expect(getRequiredJwtSecret(service, 'JWT_REFRESH_SECRET')).toBe(
      'refresh-test-secret',
    );
  });
});
