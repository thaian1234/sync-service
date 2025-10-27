import { IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { OrderStatus } from '../../database/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'The customer ID' })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 199.99, description: 'The total amount of the order' })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING, description: 'The status of the order', required: false })
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;
}
