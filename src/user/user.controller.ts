import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UserService } from './user.service';
import { User } from 'src/database/generate/database/prisma/client';
import { UserWithoutPassword } from './types/user.type';

@Controller('employees')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerAdmin(
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<void> {
    return this.userService.registerAdmin(createEmployeeDto);
  }

  async getAllEmployees(
    @Query() query: Record<string, string[] | undefined>
  ): Promise<Omit<UserWithoutPassword[]>> {}

  @Get(':id')
  async getEmployeeDetail() {}

  @Patch(':id')
  async updateEmployee(
    @Param('id') params: any,
    @Body('title') title: any,
    @Headers('Authorization') authorization: string | undefined
  ) {}

  @Delete(':id')
  async deleteEmployee() {}

  @Get('me')
  async getMyProfile() {}

  @Patch('me')
  async updateMyProfile() {}

  @Patch('change-password')
  async updatePassword() {}
}
