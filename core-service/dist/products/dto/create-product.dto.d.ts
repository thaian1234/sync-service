import { ProductStatus } from '../../database/entities/product.entity';
export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    status?: ProductStatus;
}
