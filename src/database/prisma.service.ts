import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generate/database/prisma/client';
import { TypeConfigService } from 'src/config/type-config.service';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly typeConfigService: TypeConfigService) {
    const adapter = new PrismaPg({
      connectionString: typeConfigService.get('DATABASE_URL')
    });
    super({ adapter });
  }
}
