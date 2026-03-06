import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { TypeConfigService } from 'src/config/type-config.service';

@Injectable()
export class BcryptService {
  constructor(private readonly typedConfigService: TypeConfigService) {}
  hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.typedConfigService.get('SALT_ROUNDS'));
  }
  compare(data: string, digest: string): Promise<boolean> {
    return bcrypt.compare(data, digest);
  }
}
