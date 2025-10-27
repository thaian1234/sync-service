import { DlqStatus } from '../../kafka/enums';
export declare class DlqEvent {
    id: number;
    eventId: string;
    tableName: string;
    operation: string;
    payload: any;
    errorMessage: string;
    retryCount: number;
    maxRetries: number;
    status: DlqStatus;
    createdAt: Date;
    lastRetryAt: Date;
}
