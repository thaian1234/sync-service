import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SyncOrdersDto } from './dto/sync-orders.dto';
export declare class OrdersService {
    private ordersRepository;
    constructor(ordersRepository: Repository<Order>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: number): Promise<void>;
    sync(syncOrdersDto: SyncOrdersDto): Promise<string>;
}
