import { BaseDomainEvent } from './base-domain.event';
import { CustomerDto } from '../dto/domain-event.dto';
export declare class CustomerChangedEvent extends BaseDomainEvent<CustomerDto> {
    constructor(partial: Partial<CustomerChangedEvent>);
    static generateEventId(customerId: number, operation: string, timestamp: number): string;
    getCustomerId(): number;
}
