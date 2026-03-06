import { Module } from '@nestjs/common';

import { SecurityModule } from 'src/shared/security/security.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [SecurityModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class EmployeeModule {}
