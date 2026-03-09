import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';
import { EmployeeResponseDto } from './dtos/employee-response.dto';
import { EmployeeService } from './employee.service';
import { GetEmployeeQueryDto } from './dtos/get-employee-query.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { UpdateEmployeeDto } from './dtos/employee-update.dto.';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async registerAdmin(
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.registerAdmin(createEmployeeDto);
  }

  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Get()
  async getAllEmployees(
    @Query() query: GetEmployeeQueryDto
  ): Promise<EmployeeResponseDto[]> {
    return this.employeeService.getAllEmployees(query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Get('me')
  async getMyProfile(
    @CurrentUser() user: JwtPayload
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.getEmployeeProfile(user.sub);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Get(':id')
  async getEmployeeDetail(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.getEmployeeDetail(id);
  }

  @Patch(':id')
  async updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.employeeService.deleteEmployee(id);
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: JwtPayload
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.getEmployeeProfile(user.sub);
  }

  @Patch('change-password')
  async updatePassword(
    @CurrentUser('sub') id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    await this.employeeService.changePassword(id, changePasswordDto);
  }
}
