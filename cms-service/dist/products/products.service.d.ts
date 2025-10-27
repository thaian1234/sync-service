import { Repository } from 'typeorm';
import { CmsProduct } from '../database/entities/cms-product.entity';
export declare class ProductsService {
    private cmsProductRepository;
    constructor(cmsProductRepository: Repository<CmsProduct>);
    findAll(page: number, limit: number, status?: string, category?: string): Promise<[CmsProduct[], number]>;
    findOne(id: number): Promise<CmsProduct>;
    findByCoreId(coreId: number): Promise<CmsProduct>;
    search(keyword: string): Promise<CmsProduct[]>;
    getStats(): Promise<any>;
}
