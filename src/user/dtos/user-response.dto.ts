import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/database/generate/database/prisma/enums';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  gender: Gender;
}
