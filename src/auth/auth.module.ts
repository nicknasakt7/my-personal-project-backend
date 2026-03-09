import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { SecurityModule } from 'src/shared/security/security.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [EmployeeModule, SecurityModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
