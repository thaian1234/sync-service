import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCdcEventDto } from './base-cdc-event.dto';

export class OrderCdcEventDto extends BaseCdcEventDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  customer_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  total?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
