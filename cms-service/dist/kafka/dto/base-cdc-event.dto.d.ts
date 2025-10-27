import { CdcOperation } from '../enums';
export declare abstract class BaseCdcEventDto {
    __op: CdcOperation;
    __source_ts_ms: number;
    __source_table: string;
    id: number;
}
