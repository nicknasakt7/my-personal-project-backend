import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { TypeConfigService } from 'src/config/type-config.service';
import { AuthTokenService } from 'src/shared/security/auth-token.service';
import { EmployeeService } from 'src/employee/employee.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly bcryptService: BcryptService,
    private readonly authTokenService: AuthTokenService,
    private readonly typeConfigService: TypeConfigService,
    private readonly prisma: PrismaService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.employeeService.findByEmail(loginDto.email);

    if (!user)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });

    const isMatch = await this.bcryptService.compare(loginDto.password, user.password);

    if (!isMatch)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });

    const payload = { sub: user.id, email: user.email, roleType: user.roleType };
    const accessToken = await this.authTokenService.sign(payload);

    return {
      accessToken,
      user,
      expiresIn: this.typeConfigService.get('JWT_EXPIRES_IN')
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    // Return silently even if not found — prevent email enumeration
    if (!user) return;

    // Remove any existing tokens for this user
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt }
    });

    const frontendUrl = this.typeConfigService.get('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const resend = new Resend(this.typeConfigService.get('RESEND_API_KEY'));
    await resend.emails.send({
      from: 'TeamFlow <noreply@teamflowmanagement.site>',
      to: user.email,
      subject: 'Reset your TeamFlow password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">Reset your password</h2>
          <p style="color:#555">Hi ${user.firstName},</p>
          <p style="color:#555">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
          <p style="color:#999;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#bbb;font-size:12px">TeamFlow Management System</p>
        </div>
      `
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken)
      throw new BadRequestException({ message: 'Invalid or expired reset link', code: 'INVALID_TOKEN' });

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { token } });
      throw new BadRequestException({ message: 'Reset link has expired. Please request a new one.', code: 'TOKEN_EXPIRED' });
    }

    const hashedPassword = await this.bcryptService.hash(newPassword);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    await this.prisma.passwordResetToken.delete({ where: { token } });
  }
}
