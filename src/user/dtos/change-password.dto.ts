import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MinLength
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @MinLength(6, { message: 'Password must contain 6 characters' })
  @IsAlphanumeric('en-US', {
    message: 'Password cannot contaun ibly number and letter'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Trim()
  newPassword: string;
}
