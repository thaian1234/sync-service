import { BaseCdcEventDto } from './base-cdc-event.dto';
export declare class ProductCdcEventDto extends BaseCdcEventDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    status?: string;
}
