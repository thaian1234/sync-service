import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SyncOrdersDto {
  @ApiProperty({
    description: 'The number of dummy orders to create',
    example: 10,
  })
  @IsInt()
  @Min(1)
  count: number;
}
