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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const customers_service_1 = require("../customers/customers.service");
const orders_service_1 = require("../orders/orders.service");
let SyncService = class SyncService {
    constructor(productsService, customersService, ordersService) {
        this.productsService = productsService;
        this.customersService = customersService;
        this.ordersService = ordersService;
    }
    async syncAll(syncAllDto) {
        const { productCount, customerCount, orderCount } = syncAllDto;
        const startTime = Date.now();
        const [productsResult, customersResult, ordersResult] = await Promise.all([
            this.productsService.sync({ count: productCount }),
            this.customersService.sync({ count: customerCount }),
            this.ordersService.sync({ count: orderCount }),
        ]);
        const endTime = Date.now();
        const duration = endTime - startTime;
        return {
            success: true,
            results: {
                products: productsResult,
                customers: customersResult,
                orders: ordersResult,
            },
            summary: {
                totalProducts: productCount,
                totalCustomers: customerCount,
                totalOrders: orderCount,
                totalRecords: productCount + customerCount + orderCount,
                durationMs: duration,
                durationSeconds: (duration / 1000).toFixed(2),
            },
        };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        customers_service_1.CustomersService,
        orders_service_1.OrdersService])
], SyncService);
//# sourceMappingURL=sync.service.js.map