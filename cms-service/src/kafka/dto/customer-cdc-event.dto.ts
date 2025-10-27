import { IsString, IsOptional } from 'class-validator';
import { BaseCdcEventDto } from './base-cdc-event.dto';

export class CustomerCdcEventDto extends BaseCdcEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
