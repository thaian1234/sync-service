import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SyncOrdersDto } from './dto/sync-orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    sync(syncOrdersDto: SyncOrdersDto): Promise<string>;
    create(createOrderDto: CreateOrderDto): Promise<import("../database/entities/order.entity").Order>;
    findAll(): Promise<import("../database/entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("../database/entities/order.entity").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("../database/entities/order.entity").Order>;
    remove(id: string): Promise<void>;
}
