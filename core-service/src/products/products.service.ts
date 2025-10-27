import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SyncProductsDto } from './dto/sync-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  findOne(id: number): Promise<Product> {
    return this.productsRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  async sync(syncProductsDto: SyncProductsDto): Promise<string> {
    const { count } = syncProductsDto;

    const productNames = [
      'Laptop Pro', 'Wireless Mouse', 'Mechanical Keyboard', 'Monitor 4K',
      'USB-C Hub', 'Webcam HD', 'Headphones Premium', 'External SSD',
      'Phone Case', 'Tablet Stand', 'Gaming Chair', 'Desk Lamp',
      'Power Bank', 'Cable Organizer', 'Microphone USB', 'Speaker Bluetooth'
    ];

    const descriptions = [
      'High-quality product with excellent features',
      'Durable and reliable for everyday use',
      'Premium design with modern aesthetics',
      'Professional grade equipment',
      'Affordable solution for your needs',
      'Top-rated product with great reviews'
    ];

    const categories = [
      'Electronics', 'Accessories', 'Office Supplies',
      'Gaming', 'Audio', 'Storage', 'Peripherals'
    ];

const products = [];
    for (let i = 0; i < count; i++) {
      products.push({
        name: productNames[Math.floor(Math.random() * productNames.length)] + ` #${i + 1}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        price: Math.floor(Math.random() * 500) + 10,
        stock: Math.floor(Math.random() * 100),
        category: categories[Math.floor(Math.random() * categories.length)],
        status: 'ACTIVE',
      });
    }

    // Batch insert all products at once - much more efficient than individual inserts
    await this.productsRepository.insert(products);
    return `${count} products synced successfully`;
  }
}
