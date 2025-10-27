import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SyncProductsDto } from './dto/sync-products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    sync(syncProductsDto: SyncProductsDto): Promise<string>;
    create(createProductDto: CreateProductDto): Promise<import("../database/entities/product.entity").Product>;
    findAll(): Promise<import("../database/entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("../database/entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("../database/entities/product.entity").Product>;
    remove(id: string): Promise<void>;
}
