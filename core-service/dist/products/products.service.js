"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../database/entities/product.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    create(createProductDto) {
        const product = this.productsRepository.create(createProductDto);
        return this.productsRepository.save(product);
    }
    findAll() {
        return this.productsRepository.find();
    }
    findOne(id) {
        return this.productsRepository.findOneBy({ id });
    }
    async update(id, updateProductDto) {
        await this.productsRepository.update(id, updateProductDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.productsRepository.delete(id);
    }
    async sync(syncProductsDto) {
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
        await this.productsRepository.insert(products);
        return `${count} products synced successfully`;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map