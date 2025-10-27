import { BaseDomainEvent } from './base-domain.event';
import { ProductDto } from '../dto/domain-event.dto';

export class ProductChangedEvent extends BaseDomainEvent<ProductDto> {
  constructor(partial: Partial<ProductChangedEvent>) {
    super(partial);
  }

  /**
   * Generate a unique event ID for idempotency
   */
  static generateEventId(productId: number, operation: string, timestamp: number): string {
    return `product-${productId}-${operation}-${timestamp}`;
  }

  /**
   * Get the product ID from the event
   */
  getProductId(): number {
    return this.data.id;
  }
}
