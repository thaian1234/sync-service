# Database Connection Pool Optimization for Kafka/Debezium CDC

## Overview
This document provides configuration guidelines for optimizing database connection pools when using Kafka with Debezium CDC in the CMS service.

## Architecture
- **Kafka Concurrent Processing**: 3 messages processed concurrently
- **Database Operations per Event**: 2 queries (idempotency check + upsert/update/delete)
- **Repositories**: 5 entities (CmsProduct, CmsCustomer, CmsOrder, ProcessedEvent, DlqEvent)

## Recommended Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Database Connection Pool Settings
DB_CONNECTION_POOL_SIZE=10
DB_QUEUE_LIMIT=0
DB_CONNECT_TIMEOUT=10000
DB_IDLE_TIMEOUT=60000
DB_SLOW_QUERY_THRESHOLD=1000
DB_LOGGING=false
```

### Connection Pool Size Calculation

**Formula**: `Pool Size = Concurrent Messages × DB Operations × Safety Margin`

```
Base calculation:
- 3 concurrent Kafka messages
- 2 DB operations per message (check + sync)
- Required connections: 3 × 2 = 6

Recommended: 10 connections (with safety margin for:
- DLQ operations
- Health checks
- Manual queries
- Connection overhead
)
```

### Configuration Parameters Explained

| Parameter | Default | Description |
|-----------|---------|-------------|
| `DB_CONNECTION_POOL_SIZE` | 10 | Maximum number of connections in the pool |
| `DB_QUEUE_LIMIT` | 0 | Max waiting queries (0 = unlimited queue) |
| `DB_CONNECT_TIMEOUT` | 10000ms | Connection establishment timeout |
| `DB_IDLE_TIMEOUT` | 60000ms | Time before idle connections are released |
| `DB_SLOW_QUERY_THRESHOLD` | 1000ms | Log queries taking longer than this |
| `DB_LOGGING` | false | Enable SQL query logging (dev only) |

## Scaling Guidelines

### Low Traffic (< 10 msg/sec)
```env
DB_CONNECTION_POOL_SIZE=10
KAFKA_CONFIG.CONSUMER.PARTITIONS_CONSUMED_CONCURRENTLY=3
```

### Medium Traffic (10-50 msg/sec)
```env
DB_CONNECTION_POOL_SIZE=20
KAFKA_CONFIG.CONSUMER.PARTITIONS_CONSUMED_CONCURRENTLY=5
```
**Note**: Requires 5+ topic partitions

### High Traffic (> 50 msg/sec)
```env
DB_CONNECTION_POOL_SIZE=30
KAFKA_CONFIG.CONSUMER.PARTITIONS_CONSUMED_CONCURRENTLY=10
```
**Requirements**:
- 10+ topic partitions
- Database server with higher `max_connections`
- Consider connection pooler (ProxySQL/PgBouncer)

## MySQL Server Configuration

Ensure your MySQL server is configured appropriately:

```sql
-- Check current max connections
SHOW VARIABLES LIKE 'max_connections';

-- Recommended for production
SET GLOBAL max_connections = 200;

-- Check current connection usage
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

## Monitoring

### Key Metrics to Monitor

1. **Connection Pool Exhaustion**
   - Look for "Too many connections" errors
   - Monitor `Max_used_connections` in MySQL

2. **Query Performance**
   - Track slow queries (> 1000ms)
   - Monitor query execution time in logs

3. **Kafka Consumer Lag**
   - High lag might indicate DB bottleneck
   - Check if messages are queuing

### Logging

Enable logging in development:

```env
DB_LOGGING=true
```

This will show all SQL queries and their execution times.

## Optimization Best Practices

### 1. Add Database Indexes

Ensure these indexes exist:

```sql
-- Idempotency check optimization
CREATE INDEX idx_processed_events_event_id ON processed_events(eventId);

-- Sync operation optimization
CREATE INDEX idx_cms_products_core_id ON cms_products(coreProductId);
CREATE INDEX idx_cms_customers_core_id ON cms_customers(coreCustomerId);
CREATE INDEX idx_cms_orders_core_id ON cms_orders(coreOrderId);
```

### 2. Use Transactions Efficiently

The current implementation processes events individually. For better performance:

```typescript
// Each event is already using implicit transactions
// TypeORM automatically wraps repository operations
```

### 3. Connection Pool Health

Monitor connection pool health via health endpoint:

```bash
curl http://localhost:3000/health
```

### 4. Adjust Based on Load

Monitor your application metrics and adjust:

```typescript
// In kafka/enums.ts
PARTITIONS_CONSUMED_CONCURRENTLY: 3  // Adjust based on load

// In .env
DB_CONNECTION_POOL_SIZE=10  // Must be >= concurrent messages × 2
```

## Troubleshooting

### Issue: "Too many connections"

**Solution**: Increase pool size or reduce Kafka concurrency

```env
# Option 1: Increase pool
DB_CONNECTION_POOL_SIZE=20

# Option 2: Reduce Kafka concurrency (in enums.ts)
PARTITIONS_CONSUMED_CONCURRENTLY: 2
```

### Issue: High connection pool wait time

**Solution**: Optimize queries or increase pool size

1. Check slow query log
2. Add missing indexes
3. Increase `DB_CONNECTION_POOL_SIZE`

### Issue: Connection timeouts

**Solution**: Increase timeout or check network

```env
DB_CONNECT_TIMEOUT=20000  # Increase to 20 seconds
```

## Production Checklist

- [ ] Set `DB_CONNECTION_POOL_SIZE` based on traffic
- [ ] Disable query logging (`DB_LOGGING=false`)
- [ ] Set `synchronize: false` in database.module.ts
- [ ] Configure MySQL `max_connections` appropriately
- [ ] Add database indexes
- [ ] Monitor connection pool metrics
- [ ] Set up alerts for pool exhaustion
- [ ] Test with production-like load

## Advanced: Using Connection Pooler

For very high traffic, consider using ProxySQL:

```yaml
# docker-compose.yml
proxysql:
  image: proxysql/proxysql
  environment:
    MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD}
  ports:
    - "6033:6033"
```

Then update connection to use ProxySQL:

```env
DATABASE_HOST=proxysql
DATABASE_PORT=6033
DB_CONNECTION_POOL_SIZE=50  # ProxySQL handles actual MySQL connections
```

## References

- [TypeORM Connection Options](https://typeorm.io/data-source-options)
- [MySQL Connection Handling](https://dev.mysql.com/doc/refman/8.0/en/connection-management.html)
- [Debezium Performance Tuning](https://debezium.io/documentation/reference/stable/operations/performance.html)
