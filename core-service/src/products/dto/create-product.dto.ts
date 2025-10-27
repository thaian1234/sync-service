import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsInt } from 'class-validator';
import { ProductStatus } from '../../database/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name', description: 'The name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Product Description', description: 'The description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100, description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, description: 'The stock of the product' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Category', description: 'The category of the product', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE, description: 'The status of the product', required: false })
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;
}
