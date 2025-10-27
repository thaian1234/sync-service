import { BaseDomainEvent } from "../events/base-domain.event";
import { DebeziumCdcEventDto } from "../dto/domain-event.dto";
export declare class DebeziumCdcTransformer {
    private readonly logger;
    private readonly tableTransformers;
    transform(cdcEvent: DebeziumCdcEventDto): BaseDomainEvent<any>;
    private transformCustomerEvent;
    private transformProductEvent;
    private transformOrderEvent;
    private mapOperationToEventType;
    validateCdcEvent(event: any): event is DebeziumCdcEventDto;
}
