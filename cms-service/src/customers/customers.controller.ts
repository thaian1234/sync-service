import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all synced customers with pagination' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Default: 10' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.customersService.findAll(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  getStats() {
    return this.customersService.getStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for customers by keyword' })
  @ApiQuery({ name: 'q', type: String, required: true })
  search(@Query('q') keyword: string) {
    return this.customersService.search(keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a synced customer by its CMS ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Get('core/:coreId')
  @ApiOperation({ summary: 'Get a synced customer by its Core Service ID' })
  findByCoreId(@Param('coreId', ParseIntPipe) coreId: number) {
    return this.customersService.findByCoreId(coreId);
  }
}
