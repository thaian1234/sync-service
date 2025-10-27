import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page: number, limit: number, status?: string, category?: string): Promise<[import("../database/entities/cms-product.entity").CmsProduct[], number]>;
    getStats(): Promise<any>;
    search(keyword: string): Promise<import("../database/entities/cms-product.entity").CmsProduct[]>;
    findOne(id: number): Promise<import("../database/entities/cms-product.entity").CmsProduct>;
    findByCoreId(coreId: number): Promise<import("../database/entities/cms-product.entity").CmsProduct>;
}
