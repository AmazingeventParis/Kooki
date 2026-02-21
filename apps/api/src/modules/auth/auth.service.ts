import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { registerSchema, loginSchema } from '@kooki/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly email: EmailService,
  ) {}

  async register(body: unknown) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { email, password, firstName, lastName, role, organizationName, organizationSiret, organizationRna, organizationAddress } = parsed.data;

    // Check if email already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe deja');
    }

    // Validate organization data for ORG_ADMIN
    if (role === 'ORG_ADMIN' && !organizationName) {
      throw new BadRequestException('Le nom de l\'association est requis');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with role
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'PERSONAL',
      },
    });

    // Create organization if ORG_ADMIN
    if (role === 'ORG_ADMIN' && organizationName) {
      await this.prisma.organization.create({
        data: {
          ownerUserId: user.id,
          legalName: organizationName,
          email,
          siret: organizationSiret || null,
          rnaNumber: organizationRna || null,
          address: organizationAddress || null,
        },
      });
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    // Send welcome email (non-blocking)
    this.email.sendWelcome({
      email: user.email,
      firstName: user.firstName || 'Utilisateur',
    }).catch(() => {}); // Silent fail

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(body: unknown) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // User registered via Google only (no password)
    if (!user.passwordHash) {
      throw new UnauthorizedException('Ce compte utilise la connexion Google. Cliquez sur "Continuer avec Google".');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }

    return this.sanitizeUser(user);
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return this.sanitizeUser(user);
  }

  async validateOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    // Check if user exists by googleId
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (user) {
      const token = this.generateToken(user.id, user.email, user.role);
      return { user: this.sanitizeUser(user), token };
    }

    // Check if user exists by email (registered with password before)
    user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: user.avatarUrl || profile.avatarUrl,
        },
      });
      const token = this.generateToken(user.id, user.email, user.role);
      return { user: this.sanitizeUser(user), token };
    }

    // Create new user
    user = await this.prisma.user.create({
      data: {
        email: profile.email,
        googleId: profile.googleId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
    });

    // Send welcome email (non-blocking)
    this.email.sendWelcome({
      email: user.email,
      firstName: user.firstName || 'Utilisateur',
    }).catch(() => {});

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async updateProfile(userId: string, body: { firstName?: string; lastName?: string }) {
    const { firstName, lastName } = body;

    if (!firstName && !lastName) {
      throw new BadRequestException('Aucune donnee a mettre a jour');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
      },
    });

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, body: { currentPassword?: string; newPassword: string }) {
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit faire au moins 8 caracteres');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }

    // If user has a password, verify current password
    if (user.passwordHash) {
      if (!currentPassword) {
        throw new BadRequestException('Le mot de passe actuel est requis');
      }
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Mot de passe mis a jour' };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return {
      ...sanitized,
      hasPassword: !!passwordHash,
    };
  }
}
