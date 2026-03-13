import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

import { BcryptService } from 'src/shared/security/services/bcrypt.service';

import { TypeConfigService } from 'src/config/type-config.service';
import { AuthTokenService } from 'src/shared/security/auth-token.service';
import { EmployeeService } from 'src/employee/employee.service';
import { LoginResponseDto } from './dtos/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly bcryptService: BcryptService,
    private readonly authTokenService: AuthTokenService,
    private readonly typeConfigService: TypeConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.employeeService.findByEmail(loginDto.email);

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
    const payload = {
      sub: user.id,
      email: user.email,
      roleType: user.roleType
    };
    const accessToken = await this.authTokenService.sign(payload);

    return {
      accessToken,
      user,
      expiresIn: this.typeConfigService.get('JWT_EXPIRES_IN')
    };
  }
}
