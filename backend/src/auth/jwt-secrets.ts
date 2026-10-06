import { ConfigService } from '@nestjs/config';

const FALLBACK_SECRETS = {
  JWT_ACCESS_SECRET: 'dev_access_secret_change_in_production',
  JWT_REFRESH_SECRET: 'dev_refresh_secret_change_in_production',
} as const;

export function getRequiredJwtSecret(
  configService: ConfigService,
  name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET',
): string {
  const secret = configService.get<string>(name)?.trim() || FALLBACK_SECRETS[name];

  if (!secret) {
    throw new Error(`${name} must be configured before the application starts`);
  }

  return secret;
}
