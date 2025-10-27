import { Repository } from 'typeorm';
import { CmsCustomer } from '../database/entities/cms-customer.entity';
export declare class CustomersService {
    private cmsCustomerRepository;
    constructor(cmsCustomerRepository: Repository<CmsCustomer>);
    findAll(page: number, limit: number): Promise<[CmsCustomer[], number]>;
    findOne(id: number): Promise<CmsCustomer>;
    findByCoreId(coreId: number): Promise<CmsCustomer>;
    search(keyword: string): Promise<CmsCustomer[]>;
    getStats(): Promise<any>;
}
