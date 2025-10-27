import { SyncService } from './sync.service';
import { SyncAllDto } from './dto/sync-all.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    syncAll(syncAllDto: SyncAllDto): Promise<{
        success: boolean;
        results: {
            products: string;
            customers: string;
            orders: string;
        };
        summary: {
            totalProducts: number;
            totalCustomers: number;
            totalOrders: number;
            totalRecords: number;
            durationMs: number;
            durationSeconds: string;
        };
    }>;
}
