import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SyncCustomersDto } from './dto/sync-customers.dto';
export declare class CustomersService {
    private customersRepository;
    constructor(customersRepository: Repository<Customer>);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    findOne(id: number): Promise<Customer>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: number): Promise<void>;
    sync(syncCustomersDto: SyncCustomersDto): Promise<string>;
}
