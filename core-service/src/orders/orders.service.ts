import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SyncOrdersDto } from './dto/sync-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(createOrderDto);
    return this.ordersRepository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  findOne(id: number): Promise<Order> {
    return this.ordersRepository.findOneBy({ id });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }

  async sync(syncOrdersDto: SyncOrdersDto): Promise<string> {
    const { count } = syncOrdersDto;

const statuses = [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELLED];

    const orders = [];
    for (let i = 0; i < count; i++) {
      orders.push({
        customerId: Math.floor(Math.random() * 100) + 1, // Random customer ID between 1-100
        total: Math.floor(Math.random() * 1000) + 10,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    // Batch insert all orders at once - much more efficient than individual inserts
    await this.ordersRepository.insert(orders);
    return `${count} orders synced successfully`;
  }
}
