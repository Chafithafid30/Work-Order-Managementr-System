export function validateEnvironment(config: Record<string, unknown>) {
  const jwtSecret = config.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  const expiresInSeconds = Number(config.JWT_EXPIRES_IN_SECONDS ?? 3600);
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new Error('JWT_EXPIRES_IN_SECONDS must be a positive integer');
  }
  return {
    ...config,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SECONDS: expiresInSeconds,
  };
}
