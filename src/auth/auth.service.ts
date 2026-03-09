import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { User } from 'src/database/generate/database/prisma/client';
import { TypeConfigService } from 'src/config/type-config.service';
import { AuthTokenService } from 'src/shared/security/auth-token.service';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly bcryptService: BcryptService,
    private readonly authTokenService: AuthTokenService,
    private readonly typeConfigService: TypeConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: Omit<User, 'password'>;
    expiresIn: number;
  }> {
    const user = await this.employeeService.findbyEmail(loginDto.email);

    if (!user)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });

    const isMatch = await this.bcryptService.compare(
      loginDto.password,
      user.password
    );
    if (!isMatch)
      throw new UnauthorizedException({
        message: 'The provided email or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    const accessToken = await this.authTokenService.sign({
      sub: user.id,
      email: user.email
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return {
      accessToken,
      user: rest,
      expiresIn: this.typeConfigService.get('JWT_EXPIRES_IN')
    };
  }
}
