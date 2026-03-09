import { PickType } from '@nestjs/swagger';
import { CreateEmployeeDto } from 'src/employee/dtos/create-employee.dto';

export class LoginDto extends PickType(CreateEmployeeDto, [
  'email',
  'password'
]) {}
