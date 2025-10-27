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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cms_order_entity_1 = require("../database/entities/cms-order.entity");
let OrdersService = class OrdersService {
    constructor(cmsOrderRepository) {
        this.cmsOrderRepository = cmsOrderRepository;
    }
    findAll(page, limit, status) {
        const where = {};
        if (status)
            where.status = status;
        return this.cmsOrderRepository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    findOne(id) {
        return this.cmsOrderRepository.findOneBy({ id });
    }
    findByCoreId(coreId) {
        return this.cmsOrderRepository.findOneBy({ coreOrderId: coreId });
    }
    findByCustomerId(customerId) {
        return this.cmsOrderRepository.find({ where: { customerId } });
    }
    async getStats() {
        const total = await this.cmsOrderRepository.count();
        const pending = await this.cmsOrderRepository.count({ where: { status: 'PENDING' } });
        const completed = await this.cmsOrderRepository.count({ where: { status: 'COMPLETED' } });
        const cancelled = await this.cmsOrderRepository.count({ where: { status: 'CANCELLED' } });
        return { total, pending, completed, cancelled };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cms_order_entity_1.CmsOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map