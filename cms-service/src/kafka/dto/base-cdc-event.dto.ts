import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { CdcOperation } from '../enums';
import { Type } from 'class-transformer';

export abstract class BaseCdcEventDto {
  @IsString()
  @IsNotEmpty()
  __op: CdcOperation;

  @Type(() => Number)
  @IsNumber()
  __source_ts_ms: number;

  @IsString()
  @Type(() => String)
  __source_table: string;

  @Type(() => Number)
  @IsNumber()
  id: number;
}
