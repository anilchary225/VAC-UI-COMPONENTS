import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterRequest, LoginRequest, AuthResponse, UserProfile, UpdateProfileRequest } from '@vac/shared';
import { UserModel, IUser } from '../../models/User';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { getDatabaseStatus } from '../../config/database';

export class AuthService {
  private static formatUser(user: IUser): UserProfile {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      codePreference: user.codePreference || 'typescript',
      themePreference: user.themePreference || 'dark',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  private static signToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.status !== 'connected') {
      throw new AppError('Database connection unavailable.', 503, 'SERVICE_UNAVAILABLE');
    }

    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await UserModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'user',
    });

    const token = this.signToken(user);
    return {
      token,
      user: this.formatUser(user),
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.status !== 'connected') {
      throw new AppError('Database connection unavailable.', 503, 'SERVICE_UNAVAILABLE');
    }

    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.signToken(user);
    return {
      token,
      user: this.formatUser(user),
    };
  }

  static async getCurrentUser(userId: string): Promise<UserProfile> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }
    return this.formatUser(user);
  }

  static async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.status !== 'connected') {
      throw new AppError('Database connection unavailable.', 503, 'SERVICE_UNAVAILABLE');
    }

    const updateObj: Record<string, any> = {};
    if (data.name !== undefined) updateObj.name = data.name.trim();
    if (data.codePreference !== undefined) updateObj.codePreference = data.codePreference;
    if (data.themePreference !== undefined) updateObj.themePreference = data.themePreference;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }
    return this.formatUser(user);
  }

  static async bootstrapAdmin(secret: string, email: string, name: string, password: string): Promise<UserProfile> {
    if (secret !== env.ADMIN_BOOTSTRAP_SECRET) {
      throw new AppError('Invalid admin bootstrap secret.', 403, 'FORBIDDEN');
    }

    const existingAdmin = await UserModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new AppError('Admin account already exists. Bootstrap is closed.', 409, 'ADMIN_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    });

    return this.formatUser(admin);
  }
}
