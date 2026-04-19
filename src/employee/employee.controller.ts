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
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';
import {
  EmployeeResponseDto,
  GetAllEmployeeResponseDto
} from './dtos/employee-response.dto';
import { EmployeeService } from './employee.service';
import { GetEmployeeQueryDto } from './dtos/get-employee-query.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { UpdateEmployeeDto } from './dtos/employee-update.dto.';
import { ChangePasswordDto } from './dtos/change-password.dto';

import { Roles } from 'src/auth/decorators/roles-decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { RoleType } from 'src/database/generate/database/prisma/enums';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async registerAdmin(
    @CurrentUserRole() role: RoleType,
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.registerAdmin(role, createEmployeeDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('create')
  createEmployee(
    @CurrentUserRole() role: RoleType,
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.createEmployee(role, createEmployeeDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: GetAllEmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Get()
  async getAllEmployees(
    @Query() query: GetEmployeeQueryDto
  ): Promise<GetAllEmployeeResponseDto> {
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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @UploadedFile() file: Express.Multer.File
  ): Promise<string> {
    return this.employeeService.uploadAvatar(user.sub, role, file);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatarByAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<string> {
    return this.employeeService.uploadAvatarByAdmin(id, file);
  }

  @Roles('ADMIN', 'EMPLOYEE')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,

    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.updateEmployee(user.sub, updateEmployeeDto);
  }

  @Patch('change-password')
  async updatePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    await this.employeeService.changePassword(user.sub, changePasswordDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':id/summary')
  async getEmployeeSummary(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.employeeService.getEmployeeSummary(id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
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

  @Roles('ADMIN')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: EmployeeResponseDto,
    excludeExtraneousValues: true
  })
  @Patch(':id')
  async updateEmployee(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.employeeService.deleteEmployee(id);
  }
}
