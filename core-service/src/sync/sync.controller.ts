import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncAllDto } from './dto/sync-all.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('all')
  async syncAll(@Body() syncAllDto: SyncAllDto) {
    return this.syncService.syncAll(syncAllDto);
  }
}
