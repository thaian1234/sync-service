import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DlqEvent } from '../../database/entities/dlq-event.entity';
export declare class RetryableError extends Error {
    constructor(message: string);
}
export declare class NonRetryableError extends Error {
    constructor(message: string);
}
export declare class KafkaExceptionFilter implements ExceptionFilter {
    private readonly dlqRepository;
    private readonly logger;
    constructor(dlqRepository: Repository<DlqEvent>);
    catch(exception: Error, host: ArgumentsHost): Promise<void>;
    private isRetryableError;
    private sendToDlq;
}
