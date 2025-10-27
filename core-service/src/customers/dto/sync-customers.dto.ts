import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SyncCustomersDto {
  @ApiProperty({
    description: 'The number of dummy customers to create',
    example: 10,
  })
  @IsInt()
  @Min(1)
  count: number;
}
