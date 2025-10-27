import { OrderStatus } from '../../database/entities/order.entity';
export declare class CreateOrderDto {
    customerId: number;
    total: number;
    status?: OrderStatus;
}
