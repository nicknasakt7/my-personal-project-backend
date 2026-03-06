import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { UserService } from './user.service';

@Controller('employees')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerAdmin(
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<void> {
    return this.userService.registerAdmin(createEmployeeDto);
  }

  @Get()
  async getAllEmployees() {}

  @Get(':id')
  async getEmployeeDetail() {}

  @Patch(':id')
  async updateEmployee() {}

  @Delete(':id')
  async deleteEmployee() {}

  @Get('me')
  async getMyProfile() {}

  @Patch('me')
  async updateMyProfile() {}
}
