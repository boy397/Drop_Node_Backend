import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
}

const getSecrets = () => {
  return {
    secret: process.env.JWT_SECRET || 'ecommerce_jwt_access_secret_key_2026_safe_local',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'ecommerce_jwt_refresh_secret_key_2026_safe_local',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
};

export const generateAccessToken = (payload: TokenPayload): string => {
  const cfg = getSecrets();
  return jwt.sign(payload, cfg.secret, {
    expiresIn: cfg.expiresIn as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const cfg = getSecrets();
  return jwt.sign(payload, cfg.refreshSecret, {
    expiresIn: cfg.refreshExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const cfg = getSecrets();
  return jwt.verify(token, cfg.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const cfg = getSecrets();
  return jwt.verify(token, cfg.refreshSecret) as TokenPayload;
};
