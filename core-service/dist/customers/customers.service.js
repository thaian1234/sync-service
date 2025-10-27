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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../database/entities/customer.entity");
let CustomersService = class CustomersService {
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
    }
    create(createCustomerDto) {
        const customer = this.customersRepository.create(createCustomerDto);
        return this.customersRepository.save(customer);
    }
    findAll() {
        return this.customersRepository.find();
    }
    findOne(id) {
        return this.customersRepository.findOneBy({ id });
    }
    async update(id, updateCustomerDto) {
        await this.customersRepository.update(id, updateCustomerDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.customersRepository.delete(id);
    }
    async sync(syncCustomersDto) {
        const { count } = syncCustomersDto;
        const firstNames = [
            'John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana',
            'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'
        ];
        const lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
            'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'
        ];
        const customers = [];
        for (let i = 0; i < count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            customers.push({
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
                phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            });
        }
        await this.customersRepository.insert(customers);
        return `${count} customers synced successfully`;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map