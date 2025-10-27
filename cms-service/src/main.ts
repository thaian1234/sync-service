import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { KafkaConfigService } from './kafka/config/kafka-config.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('CMS Service API')
    .setDescription('API for querying synchronized products, customers, orders and managing DLQ events. Data is synced from core service via Kafka CDC.')
    .setVersion('2.0')
    .addTag('products', 'Product queries')
    .addTag('customers', 'Customer queries')
    .addTag('orders', 'Order queries')
    .addTag('dlq', 'Dead Letter Queue management')
    .addTag('health', 'Health checks')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Connect Kafka microservice
  const kafkaConfigService = app.get(KafkaConfigService);
  const microserviceOptions = kafkaConfigService.getKafkaMicroserviceOptions();
  app.connectMicroservice<MicroserviceOptions>(microserviceOptions);

  // Start all microservices
  await app.startAllMicroservices();
  logger.log('Kafka microservice started successfully');

  // Start HTTP server
  await app.listen(3002);
  logger.log(`HTTP server listening on port 3002`);
  logger.log(`Swagger docs available at http://localhost:3002/api-docs`);
  logger.log(`Health check available at http://localhost:3002/health`);

  // Graceful shutdown
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
