import { Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';

import { JwtModule } from '@nestjs/jwt';
import { AuthTokenService } from './auth-token.service';

@Module({
  imports: [JwtModule],
  providers: [BcryptService, AuthTokenService],
  exports: [BcryptService, AuthTokenService]
})
export class SecurityModule {}
