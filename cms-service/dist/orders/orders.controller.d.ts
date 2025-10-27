import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(page: number, limit: number, status?: string): Promise<[import("../database/entities/cms-order.entity").CmsOrder[], number]>;
    getStats(): Promise<any>;
    findByCustomerId(customerId: number): Promise<import("../database/entities/cms-order.entity").CmsOrder[]>;
    findOne(id: number): Promise<import("../database/entities/cms-order.entity").CmsOrder>;
    findByCoreId(coreId: number): Promise<import("../database/entities/cms-order.entity").CmsOrder>;
}
