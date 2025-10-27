import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CmsCustomer } from '../database/entities/cms-customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CmsCustomer)
    private cmsCustomerRepository: Repository<CmsCustomer>,
  ) {}

  findAll(page: number, limit: number): Promise<[CmsCustomer[], number]> {
    return this.cmsCustomerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number): Promise<CmsCustomer> {
    return this.cmsCustomerRepository.findOneBy({ id });
  }

  findByCoreId(coreId: number): Promise<CmsCustomer> {
    return this.cmsCustomerRepository.findOneBy({ coreCustomerId: coreId });
  }

  search(keyword: string): Promise<CmsCustomer[]> {
    return this.cmsCustomerRepository.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
      ],
    });
  }

  async getStats(): Promise<any> {
    const total = await this.cmsCustomerRepository.count();
    return { total };
  }
}
