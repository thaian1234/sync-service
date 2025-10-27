import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SyncProductsDto {
  @ApiProperty({
    description: 'The number of dummy products to create',
    example: 10,
  })
  @IsInt()
  @Min(1)
  count: number;
}
