import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { EmployeeResponseDto } from 'src/employee/dtos/employee-response.dto';

@Exclude()
export class LoginResponseDto {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @Expose()
  @ApiProperty()
  expiresIn: number;

  @Expose()
  @ApiProperty()
  user: EmployeeResponseDto;
}
