import { ApiProperty } from '@nestjs/swagger';
import { EmployeeResponseDto } from 'src/employee/dtos/employee-response.dto';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: EmployeeResponseDto;
}
