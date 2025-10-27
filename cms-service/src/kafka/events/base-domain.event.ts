import { EventType, EVENT_TYPE } from '../enums';

// Re-export for backward compatibility
export { EventType, EVENT_TYPE } from '../enums';

export abstract class BaseDomainEvent<T = any> {
  /**
   * Unique identifier for this event
   */
  eventId: string;

  /**
   * Type of change operation
   */
  type: EventType;

  /**
   * Source table name
   */
  source: string;

  /**
   * Timestamp when the event occurred (milliseconds)
   */
  timestamp: number;

  /**
   * The actual payload data
   */
  data: T;

  /**
   * Metadata from CDC
   */
  metadata?: {
    transactionId?: string;
    position?: string;
    snapshot?: boolean;
  };

  constructor(partial: Partial<BaseDomainEvent<T>>) {
    Object.assign(this, partial);
  }
}
