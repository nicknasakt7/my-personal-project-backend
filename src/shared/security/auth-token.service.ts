import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { TypeConfigService } from 'src/config/type-config.service';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly typeConfigService: TypeConfigService,
    private readonly jwtService: JwtService
  ) {}
  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.typeConfigService.get('JWT_SECRET'),
      expiresIn: this.typeConfigService.get('JWT_EXPIRES_IN')
    });
  }
  verify(token: string): Promise<JwtPayload & { iat: number; exp: number }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.typeConfigService.get('JWT_SECRET')
    });
  }
}
