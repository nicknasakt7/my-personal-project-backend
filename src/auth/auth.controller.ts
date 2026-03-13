import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseInterceptors
} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';

import { AuthService } from './auth.service';

import { Public } from './decorators/public.decorator';
import { LoginResponseDto } from './dtos/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: LoginResponseDto, excludeExtraneousValues: true })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const data = await this.authService.login(loginDto);
    return data;
  }
}
