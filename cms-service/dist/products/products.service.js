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
const cms_product_entity_1 = require("../database/entities/cms-product.entity");
let ProductsService = class ProductsService {
    constructor(cmsProductRepository) {
        this.cmsProductRepository = cmsProductRepository;
    }
    findAll(page, limit, status, category) {
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        return this.cmsProductRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    findOne(id) {
        return this.cmsProductRepository.findOneBy({ id });
    }
    findByCoreId(coreId) {
        return this.cmsProductRepository.findOneBy({ coreProductId: coreId });
    }
    search(keyword) {
        return this.cmsProductRepository.find({
            where: [
                { name: (0, typeorm_2.Like)(`%${keyword}%`) },
                { description: (0, typeorm_2.Like)(`%${keyword}%`) },
            ],
        });
    }
    async getStats() {
        const total = await this.cmsProductRepository.count();
        const active = await this.cmsProductRepository.count({ where: { status: 'ACTIVE' } });
        const inactive = await this.cmsProductRepository.count({ where: { status: 'INACTIVE' } });
        return { total, active, inactive };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cms_product_entity_1.CmsProduct)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map