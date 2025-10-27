import { BaseDomainEvent } from './base-domain.event';
import { ProductDto } from '../dto/domain-event.dto';
export declare class ProductChangedEvent extends BaseDomainEvent<ProductDto> {
    constructor(partial: Partial<ProductChangedEvent>);
    static generateEventId(productId: number, operation: string, timestamp: number): string;
    getProductId(): number;
}
