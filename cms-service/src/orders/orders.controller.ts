import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all synced orders with pagination and filtering' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Default: 10' })
  @ApiQuery({ name: 'status', type: String, required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll(page, limit, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  getStats() {
    return this.ordersService.getStats();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all orders for a specific customer' })
  findByCustomerId(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.ordersService.findByCustomerId(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a synced order by its CMS ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Get('core/:coreId')
  @ApiOperation({ summary: 'Get a synced order by its Core Service ID' })
  findByCoreId(@Param('coreId', ParseIntPipe) coreId: number) {
    return this.ordersService.findByCoreId(coreId);
  }
}
