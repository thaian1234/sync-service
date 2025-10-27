import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsOrder } from '../database/entities/cms-order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(CmsOrder)
    private cmsOrderRepository: Repository<CmsOrder>,
  ) {}

  findAll(page: number, limit: number, status?: string): Promise<[CmsOrder[], number]> {
    const where: any = {};
    if (status) where.status = status;

    return this.cmsOrderRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number): Promise<CmsOrder> {
    return this.cmsOrderRepository.findOneBy({ id });
  }

  findByCoreId(coreId: number): Promise<CmsOrder> {
    return this.cmsOrderRepository.findOneBy({ coreOrderId: coreId });
  }

  findByCustomerId(customerId: number): Promise<CmsOrder[]> {
    return this.cmsOrderRepository.find({ where: { customerId } });
  }

  async getStats(): Promise<any> {
    const total = await this.cmsOrderRepository.count();
    const pending = await this.cmsOrderRepository.count({ where: { status: 'PENDING' } });
    const completed = await this.cmsOrderRepository.count({ where: { status: 'COMPLETED' } });
    const cancelled = await this.cmsOrderRepository.count({ where: { status: 'CANCELLED' } });
    return { total, pending, completed, cancelled };
  }
}
