import { Module } from '@nestjs/common';

import { SecurityModule } from 'src/shared/security/security.module';

import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
  imports: [SecurityModule, UploadModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService]
})
export class EmployeeModule {}
