import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all synced products with pagination and filtering' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Default: 10' })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.productsService.findAll(page, limit, status, category);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  getStats() {
    return this.productsService.getStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for products by keyword' })
  @ApiQuery({ name: 'q', type: String, required: true })
  search(@Query('q') keyword: string) {
    return this.productsService.search(keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a synced product by its CMS ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get('core/:coreId')
  @ApiOperation({ summary: 'Get a synced product by its Core Service ID' })
  findByCoreId(@Param('coreId', ParseIntPipe) coreId: number) {
    return this.productsService.findByCoreId(coreId);
  }
}
