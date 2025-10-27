import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { SyncAllDto } from './dto/sync-all.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
  ) {}

  async syncAll(syncAllDto: SyncAllDto) {
    const { productCount, customerCount, orderCount } = syncAllDto;

    const startTime = Date.now();

    // Run all syncs in parallel for maximum performance
    const [productsResult, customersResult, ordersResult] = await Promise.all([
      this.productsService.sync({ count: productCount }),
      this.customersService.sync({ count: customerCount }),
      this.ordersService.sync({ count: orderCount }),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: true,
      results: {
        products: productsResult,
        customers: customersResult,
        orders: ordersResult,
      },
      summary: {
        totalProducts: productCount,
        totalCustomers: customerCount,
        totalOrders: orderCount,
        totalRecords: productCount + customerCount + orderCount,
        durationMs: duration,
        durationSeconds: (duration / 1000).toFixed(2),
      },
    };
  }
}
