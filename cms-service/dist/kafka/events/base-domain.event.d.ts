import { EventType } from '../enums';
export { EventType, EVENT_TYPE } from '../enums';
export declare abstract class BaseDomainEvent<T = any> {
    eventId: string;
    type: EventType;
    source: string;
    timestamp: number;
    data: T;
    metadata?: {
        transactionId?: string;
        position?: string;
        snapshot?: boolean;
    };
    constructor(partial: Partial<BaseDomainEvent<T>>);
}
