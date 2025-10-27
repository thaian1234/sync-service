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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsOrder = void 0;
const typeorm_1 = require("typeorm");
let CmsOrder = class CmsOrder {
};
exports.CmsOrder = CmsOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CmsOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'core_order_id', unique: true }),
    __metadata("design:type", Number)
], CmsOrder.prototype, "coreOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], CmsOrder.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CmsOrder.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CmsOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'synced_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CmsOrder.prototype, "syncedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CmsOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CmsOrder.prototype, "updatedAt", void 0);
exports.CmsOrder = CmsOrder = __decorate([
    (0, typeorm_1.Entity)('cms_orders')
], CmsOrder);
//# sourceMappingURL=cms-order.entity.js.map