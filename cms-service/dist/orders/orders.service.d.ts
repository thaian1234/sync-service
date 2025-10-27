import { Repository } from 'typeorm';
import { CmsOrder } from '../database/entities/cms-order.entity';
export declare class OrdersService {
    private cmsOrderRepository;
    constructor(cmsOrderRepository: Repository<CmsOrder>);
    findAll(page: number, limit: number, status?: string): Promise<[CmsOrder[], number]>;
    findOne(id: number): Promise<CmsOrder>;
    findByCoreId(coreId: number): Promise<CmsOrder>;
    findByCustomerId(customerId: number): Promise<CmsOrder[]>;
    getStats(): Promise<any>;
}
