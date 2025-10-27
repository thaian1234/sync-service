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
exports.CmsCustomer = void 0;
const typeorm_1 = require("typeorm");
let CmsCustomer = class CmsCustomer {
};
exports.CmsCustomer = CmsCustomer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CmsCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'core_customer_id', unique: true }),
    __metadata("design:type", Number)
], CmsCustomer.prototype, "coreCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CmsCustomer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CmsCustomer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CmsCustomer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'synced_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CmsCustomer.prototype, "syncedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CmsCustomer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CmsCustomer.prototype, "updatedAt", void 0);
exports.CmsCustomer = CmsCustomer = __decorate([
    (0, typeorm_1.Entity)('cms_customers')
], CmsCustomer);
//# sourceMappingURL=cms-customer.entity.js.map