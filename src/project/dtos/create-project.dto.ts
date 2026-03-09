import { OmitType } from '@nestjs/swagger';
import { BaseProjectDto } from './base-project.dto';

export class CreateProjectDto extends OmitType(BaseProjectDto, ['status']) {}
