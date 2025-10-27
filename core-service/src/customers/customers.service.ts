import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SyncCustomersDto } from './dto/sync-customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  findOne(id: number): Promise<Customer> {
    return this.customersRepository.findOneBy({ id });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    await this.customersRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.customersRepository.delete(id);
  }

  async sync(syncCustomersDto: SyncCustomersDto): Promise<string> {
    const { count } = syncCustomersDto;

    const firstNames = [
      'John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana',
      'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'
    ];

const customers = [];
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      customers.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      });
    }

    // Batch insert all customers at once - much more efficient than individual inserts
    await this.customersRepository.insert(customers);
    return `${count} customers synced successfully`;
  }
}
