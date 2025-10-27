import { BaseCdcEventDto } from './base-cdc-event.dto';
export declare class OrderCdcEventDto extends BaseCdcEventDto {
    customer_id?: number;
    total?: number;
    status?: string;
}
