import { DlqStatus } from '../../kafka/enums';
export declare class DlqQueryDto {
    status?: DlqStatus;
    tableName?: string;
    operation?: string;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
}
export declare class BulkRetryDto {
    status?: DlqStatus;
    tableName?: string;
    limit?: number;
}
export declare class BulkArchiveDto {
    olderThan?: string;
    status?: DlqStatus;
}
