import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CmsProduct } from './entities/cms-product.entity';
import { CmsCustomer } from './entities/cms-customer.entity';
import { CmsOrder } from './entities/cms-order.entity';
import { ProcessedEvent } from './entities/processed-event.entity';
import { DlqEvent } from './entities/dlq-event.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [CmsProduct, CmsCustomer, CmsOrder, ProcessedEvent, DlqEvent],
        synchronize: true, // Not for production
        retryAttempts: 10,
        retryDelay: 5000,
        // Connection Pool Configuration for Kafka/Debezium CDC
        extra: {
          // Connection pool settings
          connectionLimit: configService.get<number>('DB_CONNECTION_POOL_SIZE', 10),
          waitForConnections: true,
          queueLimit: configService.get<number>('DB_QUEUE_LIMIT', 0),
          // Connection timeout
          connectTimeout: configService.get<number>('DB_CONNECT_TIMEOUT', 10000),
          // Connection idle timeout (release unused connections)
          idleTimeout: configService.get<number>('DB_IDLE_TIMEOUT', 60000),
          // Enable connection keep-alive
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
        },
        // TypeORM-level connection pool
        poolSize: configService.get<number>('DB_CONNECTION_POOL_SIZE', 10),
        // Logging for monitoring
        logging: configService.get<boolean>('DB_LOGGING', false),
        logger: 'advanced-console',
        maxQueryExecutionTime: configService.get<number>('DB_SLOW_QUERY_THRESHOLD', 1000),
      }),
    }),
  ],
})
export class DatabaseModule {}
