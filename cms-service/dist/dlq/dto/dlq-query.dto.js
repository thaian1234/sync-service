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
exports.BulkArchiveDto = exports.BulkRetryDto = exports.DlqQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../kafka/enums");
class DlqQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.DlqQueryDto = DlqQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.DlqStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DlqStatus),
    __metadata("design:type", String)
], DlqQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by table name', example: 'products' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DlqQueryDto.prototype, "tableName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by operation', example: 'c' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DlqQueryDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DlqQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], DlqQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter events created after this date', example: '2024-01-01T00:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DlqQueryDto.prototype, "createdAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter events created before this date', example: '2024-12-31T23:59:59Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DlqQueryDto.prototype, "createdBefore", void 0);
class BulkRetryDto {
    constructor() {
        this.limit = 100;
    }
}
exports.BulkRetryDto = BulkRetryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.DlqStatus, description: 'Retry all events with this status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DlqStatus),
    __metadata("design:type", String)
], BulkRetryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Retry events for this table', example: 'products' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkRetryDto.prototype, "tableName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of events to retry', example: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], BulkRetryDto.prototype, "limit", void 0);
class BulkArchiveDto {
}
exports.BulkArchiveDto = BulkArchiveDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Archive events older than this date', example: '2024-01-01T00:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkArchiveDto.prototype, "olderThan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.DlqStatus, description: 'Archive only events with this status', example: enums_1.DlqStatus.SUCCESS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DlqStatus),
    __metadata("design:type", String)
], BulkArchiveDto.prototype, "status", void 0);
//# sourceMappingURL=dlq-query.dto.js.map