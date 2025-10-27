import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { SyncAllDto } from './dto/sync-all.dto';
export declare class SyncService {
    private readonly productsService;
    private readonly customersService;
    private readonly ordersService;
    constructor(productsService: ProductsService, customersService: CustomersService, ordersService: OrdersService);
    syncAll(syncAllDto: SyncAllDto): Promise<{
        success: boolean;
        results: {
            products: string;
            customers: string;
            orders: string;
        };
        summary: {
            totalProducts: number;
            totalCustomers: number;
            totalOrders: number;
            totalRecords: number;
            durationMs: number;
            durationSeconds: string;
        };
    }>;
}
