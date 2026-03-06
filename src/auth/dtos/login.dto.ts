import { PickType } from '@nestjs/swagger';
import { BaseEmployeeDto } from 'src/user/dtos/base-employee.dto';

export class LoginDto extends PickType(BaseEmployeeDto, [
  'email',
  'password'
]) {}
