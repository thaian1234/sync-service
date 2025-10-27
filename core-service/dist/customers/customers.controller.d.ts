import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SyncCustomersDto } from './dto/sync-customers.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    sync(syncCustomersDto: SyncCustomersDto): Promise<string>;
    create(createCustomerDto: CreateCustomerDto): Promise<import("../database/entities/customer.entity").Customer>;
    findAll(): Promise<import("../database/entities/customer.entity").Customer[]>;
    findOne(id: string): Promise<import("../database/entities/customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("../database/entities/customer.entity").Customer>;
    remove(id: string): Promise<void>;
}
