import { IsEnum, IsOptional, IsInt, Min, Max, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DlqStatus } from '../../kafka/enums';

export class DlqQueryDto {
  @ApiPropertyOptional({ enum: DlqStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(DlqStatus)
  status?: DlqStatus;

  @ApiPropertyOptional({ description: 'Filter by table name', example: 'products' })
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiPropertyOptional({ description: 'Filter by operation', example: 'c' })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter events created after this date', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter events created before this date', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}

export class BulkRetryDto {
  @ApiPropertyOptional({ enum: DlqStatus, description: 'Retry all events with this status' })
  @IsOptional()
  @IsEnum(DlqStatus)
  status?: DlqStatus;

  @ApiPropertyOptional({ description: 'Retry events for this table', example: 'products' })
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiPropertyOptional({ description: 'Maximum number of events to retry', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}

export class BulkArchiveDto {
  @ApiPropertyOptional({ description: 'Archive events older than this date', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  olderThan?: string;

  @ApiPropertyOptional({ enum: DlqStatus, description: 'Archive only events with this status', example: DlqStatus.SUCCESS })
  @IsOptional()
  @IsEnum(DlqStatus)
  status?: DlqStatus;
}
