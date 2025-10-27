import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CmsProduct])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
