import rateLimit from 'express-rate-limit';

// Safe IP extractor resilient to serverless/mock environments
const getClientIp = (req: any): string => {
  return (
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
};

// Rate limiter for authentication routes (login, register, bootstrap-admin)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 30, // 30 requests per 15 minutes in dev/prod
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 50000 : 1500, // 1500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});
