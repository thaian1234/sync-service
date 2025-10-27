import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ProductsModule, CustomersModule, OrdersModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
