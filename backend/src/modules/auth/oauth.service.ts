import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserModel, IUser } from '../../models/User';
import { AppError } from '../../middleware/errorHandler';
import { getDatabaseStatus } from '../../config/database';

export class OAuthService {
  /**
   * Generates a tamper-proof state token for CSRF protection in OAuth flows.
   */
  static generateOAuthState(provider: 'github' | 'google'): string {
    const random = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const payload = `${provider}:${random}:${timestamp}`;
    const signature = crypto.createHmac('sha256', env.JWT_SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}:${signature}`).toString('base64url');
  }

  /**
   * Validates state token and ensures it is authentic and unexpired (< 10 minutes).
   */
  static validateOAuthState(stateStr: string, expectedProvider: 'github' | 'google'): boolean {
    try {
      const decoded = Buffer.from(stateStr, 'base64url').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 4) return false;

      const [provider, random, timestampStr, signature] = parts;
      if (provider !== expectedProvider) return false;

      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > 10 * 60 * 1000) {
        // Expired after 10 minutes
        return false;
      }

      const expectedPayload = `${provider}:${random}:${timestampStr}`;
      const expectedSignature = crypto.createHmac('sha256', env.JWT_SECRET).update(expectedPayload).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Safe redirect target validation preventing open redirect vulnerabilities.
   */
  static getSafeRedirectUrl(token?: string, errorMessage?: string): string {
    const base = env.FRONTEND_URL.replace(/\/+$/, '');
    const url = new URL(base);
    if (token) {
      url.searchParams.set('token', token);
    }
    if (errorMessage) {
      url.searchParams.set('oauth_error', errorMessage);
    }
    return url.toString();
  }

  /**
   * Sign a standard JWT token for an authenticated user.
   */
  static signUserToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: (env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );
  }

  /**
   * Link or create user from GitHub profile safely.
   */
  static async handleGitHubUser(profile: {
    id: string | number;
    login: string;
    name?: string;
    email: string;
    avatar_url?: string;
  }): Promise<{ user: IUser; token: string }> {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.status !== 'connected') {
      throw new AppError('Database connection unavailable for OAuth login.', 503, 'SERVICE_UNAVAILABLE');
    }

    const githubId = String(profile.id);
    const email = profile.email.toLowerCase().trim();

    // 1. Try finding by githubId first
    let user = await UserModel.findOne({ githubId });

    if (!user) {
      // 2. Try linking to existing account with matching verified email
      user = await UserModel.findOne({ email });
      if (user) {
        user.githubId = githubId;
        if (!user.avatarUrl && profile.avatar_url) {
          user.avatarUrl = profile.avatar_url;
        }
        await user.save();
      } else {
        // 3. Create a new account
        user = await UserModel.create({
          name: profile.name?.trim() || profile.login,
          email,
          githubId,
          avatarUrl: profile.avatar_url,
          role: 'user',
        });
      }
    }

    const token = this.signUserToken(user);
    return { user, token };
  }

  /**
   * Link or create user from Google profile safely.
   */
  static async handleGoogleUser(profile: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }): Promise<{ user: IUser; token: string }> {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.status !== 'connected') {
      throw new AppError('Database connection unavailable for OAuth login.', 503, 'SERVICE_UNAVAILABLE');
    }

    const googleId = String(profile.sub);
    const email = profile.email.toLowerCase().trim();

    // 1. Try finding by googleId first
    let user = await UserModel.findOne({ googleId });

    if (!user) {
      // 2. Try linking to existing account with matching email
      user = await UserModel.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (!user.avatarUrl && profile.picture) {
          user.avatarUrl = profile.picture;
        }
        await user.save();
      } else {
        // 3. Create a new account
        user = await UserModel.create({
          name: profile.name?.trim() || email.split('@')[0],
          email,
          googleId,
          avatarUrl: profile.picture,
          role: 'user',
        });
      }
    }

    const token = this.signUserToken(user);
    return { user, token };
  }
}
