import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

import { AuthService } from './auth.service';
import { UserWithoutPassword } from 'src/employee/types/user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string;
    user: UserWithoutPassword;
    expiresIn: number;
  }> {
    return this.authService.login(loginDto);
  }
}
