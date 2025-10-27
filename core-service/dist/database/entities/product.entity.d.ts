export declare enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DISCONTINUED = "DISCONTINUED"
}
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
}
