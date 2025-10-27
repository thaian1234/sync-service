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
exports.DlqEvent = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../../kafka/enums");
let DlqEvent = class DlqEvent {
};
exports.DlqEvent = DlqEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DlqEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], DlqEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name', length: 50 }),
    __metadata("design:type", String)
], DlqEvent.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], DlqEvent.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], DlqEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text' }),
    __metadata("design:type", String)
], DlqEvent.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], DlqEvent.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_retries', default: 5 }),
    __metadata("design:type", Number)
], DlqEvent.prototype, "maxRetries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.DlqStatus, default: enums_1.DlqStatus.PENDING }),
    __metadata("design:type", String)
], DlqEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DlqEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_retry_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DlqEvent.prototype, "lastRetryAt", void 0);
exports.DlqEvent = DlqEvent = __decorate([
    (0, typeorm_1.Entity)('dlq_events')
], DlqEvent);
//# sourceMappingURL=dlq-event.entity.js.map