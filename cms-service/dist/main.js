"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kafka_config_service_1 = require("./kafka/config/kafka-config.service");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CMS Service API')
        .setDescription('API for querying synchronized products, customers, orders and managing DLQ events. Data is synced from core service via Kafka CDC.')
        .setVersion('2.0')
        .addTag('products', 'Product queries')
        .addTag('customers', 'Customer queries')
        .addTag('orders', 'Order queries')
        .addTag('dlq', 'Dead Letter Queue management')
        .addTag('health', 'Health checks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const kafkaConfigService = app.get(kafka_config_service_1.KafkaConfigService);
    const microserviceOptions = kafkaConfigService.getKafkaMicroserviceOptions();
    app.connectMicroservice(microserviceOptions);
    await app.startAllMicroservices();
    logger.log('Kafka microservice started successfully');
    await app.listen(3002);
    logger.log(`HTTP server listening on port 3002`);
    logger.log(`Swagger docs available at http://localhost:3002/api-docs`);
    logger.log(`Health check available at http://localhost:3002/health`);
    process.on('SIGTERM', async () => {
        logger.log('SIGTERM signal received: closing application');
        await app.close();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        logger.log('SIGINT signal received: closing application');
        await app.close();
        process.exit(0);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map