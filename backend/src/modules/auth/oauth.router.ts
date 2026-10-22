import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { OAuthService } from './oauth.service';
import { AppError } from '../../middleware/errorHandler';

export const oauthRouter = Router();

// Helper to determine canonical backend base URL for callbacks
function getCallbackBase(req: Request): string {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/, '');
  }
  const host = req.get('host') || `localhost:${env.PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// --------------------------------------------------------------------------
// 0. Public OAuth Configuration Status
// --------------------------------------------------------------------------
oauthRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  });
});

// --------------------------------------------------------------------------
// 1. GitHub OAuth Flow
// --------------------------------------------------------------------------
oauthRouter.get('/github', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      throw new AppError(
        'GitHub OAuth is not configured on this server. Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        503,
        'OAUTH_NOT_CONFIGURED'
      );
    }

    const state = OAuthService.generateOAuthState('github');
    const callbackUrl = `${getCallbackBase(req)}/api/auth/oauth/github/callback`;
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'read:user user:email',
      state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  } catch (err) {
    next(err);
  }
});

oauthRouter.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, error_description || error));
    }

    if (!code || !state) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, 'Missing code or state in OAuth callback.'));
    }

    if (!OAuthService.validateOAuthState(state, 'github')) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, 'Invalid or expired OAuth state token.'));
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(
        OAuthService.getSafeRedirectUrl(undefined, tokenData.error_description || 'Failed to obtain GitHub access token.')
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'VAC-UI-COMPONENTS',
      },
    });
    const ghUser = await userRes.json();

    // Fetch user verified primary email
    let userEmail = ghUser.email;
    if (!userEmail) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'VAC-UI-COMPONENTS',
        },
      });
      const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailRes.json().catch(() => []);
      const primaryVerified = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified);
      userEmail = primaryVerified ? primaryVerified.email : null;
    }

    if (!userEmail) {
      return res.redirect(
        OAuthService.getSafeRedirectUrl(undefined, 'Unable to retrieve verified email from GitHub account.')
      );
    }

    // Link or create user in database
    const { token } = await OAuthService.handleGitHubUser({
      id: ghUser.id,
      login: ghUser.login,
      name: ghUser.name,
      email: userEmail,
      avatar_url: ghUser.avatar_url,
    });

    res.redirect(OAuthService.getSafeRedirectUrl(token));
  } catch (err: any) {
    res.redirect(OAuthService.getSafeRedirectUrl(undefined, err?.message || 'GitHub OAuth authentication failed.'));
  }
});

// --------------------------------------------------------------------------
// 2. Google OAuth Flow
// --------------------------------------------------------------------------
oauthRouter.get('/google', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new AppError(
        'Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
        503,
        'OAUTH_NOT_CONFIGURED'
      );
    }

    const state = OAuthService.generateOAuthState('google');
    const callbackUrl = `${getCallbackBase(req)}/api/auth/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      prompt: 'select_account',
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    next(err);
  }
});

oauthRouter.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, error_description || error));
    }

    if (!code || !state) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, 'Missing code or state in OAuth callback.'));
    }

    if (!OAuthService.validateOAuthState(state, 'google')) {
      return res.redirect(OAuthService.getSafeRedirectUrl(undefined, 'Invalid or expired OAuth state token.'));
    }

    const callbackUrl = `${getCallbackBase(req)}/api/auth/oauth/google/callback`;

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(
        OAuthService.getSafeRedirectUrl(undefined, tokenData.error_description || 'Failed to obtain Google access token.')
      );
    }

    // Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email || !googleUser.sub) {
      return res.redirect(
        OAuthService.getSafeRedirectUrl(undefined, 'Unable to retrieve profile from Google account.')
      );
    }

    // Link or create user in database
    const { token } = await OAuthService.handleGoogleUser({
      sub: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    res.redirect(OAuthService.getSafeRedirectUrl(token));
  } catch (err: any) {
    res.redirect(OAuthService.getSafeRedirectUrl(undefined, err?.message || 'Google OAuth authentication failed.'));
  }
});
