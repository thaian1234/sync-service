import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(page: number, limit: number): Promise<[import("../database/entities/cms-customer.entity").CmsCustomer[], number]>;
    getStats(): Promise<any>;
    search(keyword: string): Promise<import("../database/entities/cms-customer.entity").CmsCustomer[]>;
    findOne(id: number): Promise<import("../database/entities/cms-customer.entity").CmsCustomer>;
    findByCoreId(coreId: number): Promise<import("../database/entities/cms-customer.entity").CmsCustomer>;
}
