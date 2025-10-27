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
exports.ProcessedEvent = void 0;
const typeorm_1 = require("typeorm");
let ProcessedEvent = class ProcessedEvent {
};
exports.ProcessedEvent = ProcessedEvent;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'event_id', length: 100 }),
    __metadata("design:type", String)
], ProcessedEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name', length: 50 }),
    __metadata("design:type", String)
], ProcessedEvent.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'record_id' }),
    __metadata("design:type", Number)
], ProcessedEvent.prototype, "recordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], ProcessedEvent.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'processed_at' }),
    __metadata("design:type", Date)
], ProcessedEvent.prototype, "processedAt", void 0);
exports.ProcessedEvent = ProcessedEvent = __decorate([
    (0, typeorm_1.Entity)('processed_events')
], ProcessedEvent);
//# sourceMappingURL=processed-event.entity.js.map