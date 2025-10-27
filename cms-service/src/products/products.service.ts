import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(CmsProduct)
    private cmsProductRepository: Repository<CmsProduct>,
  ) {}

  findAll(page: number, limit: number, status?: string, category?: string): Promise<[CmsProduct[], number]> {
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    return this.cmsProductRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number): Promise<CmsProduct> {
    return this.cmsProductRepository.findOneBy({ id });
  }

  findByCoreId(coreId: number): Promise<CmsProduct> {
    return this.cmsProductRepository.findOneBy({ coreProductId: coreId });
  }

  search(keyword: string): Promise<CmsProduct[]> {
    return this.cmsProductRepository.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) },
      ],
    });
  }

  async getStats(): Promise<any> {
    const total = await this.cmsProductRepository.count();
    const active = await this.cmsProductRepository.count({ where: { status: 'ACTIVE' } });
    const inactive = await this.cmsProductRepository.count({ where: { status: 'INACTIVE' } });
    return { total, active, inactive };
  }
}
