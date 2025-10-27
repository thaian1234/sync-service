# Dead Letter Queue (DLQ) - Best Practices & Implementation Guide

## Overview

This document outlines the Dead Letter Queue (DLQ) implementation for handling failed events in the CMS service. The DLQ system provides robust error handling, automated retry with exponential backoff, manual admin controls, and alerting capabilities.

## Architecture

### Components

1. **DlqEvent Entity** - Database storage for failed events
2. **DlqService** - Core business logic for DLQ operations
3. **RetryService** - Automated and manual retry logic with transactions
4. **DlqAlertService** - Multi-channel alerting system
5. **DlqController** - REST API for admin operations

### Event Flow

```
Event Processing
     ↓
  [Fails]
     ↓
Send to DLQ (PENDING)
     ↓
Exponential Backoff Wait
     ↓
Auto-Retry (RETRYING)
     ├─ Success → ARCHIVE
     └─ Failure → Back to PENDING
                   ↓
            Max Retries Exceeded
                   ↓
              FAILED (Alert Admin)
```

## Best Practices

### 1. **Non-Blocking Architecture** ✅

**Implementation:**

-   Uses cron-based batch processing (every 10-30 seconds)
-   Processes events in batches of 100
-   Continues until no more events are ready for retry
-   Main application flow is never blocked

**Why:** Prevents cascade failures and maintains system throughput

### 2. **Exponential Backoff with Jitter** ✅

**Formula:**

```typescript
delay = min((baseDelay * 2) ^ retryCount, maxDelay) + random(0, jitter * delay);
```

**Configuration:**

-   Base delay: 1 second
-   Max delay: 5 minutes
-   Jitter factor: 30%

**Why:**

-   Prevents thundering herd problem
-   Gives downstream systems time to recover
-   Distributes retry load over time

### 3. **Transactional Retry** ✅

**Implementation:**

```typescript
const queryRunner = dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
	// 1. Mark as RETRYING
	// 2. Transform event
	// 3. Sync to destination
	// 4. Mark as SUCCESS
	await queryRunner.commitTransaction();
} catch (error) {
	await queryRunner.rollbackTransaction();
	// Increment retry count in separate transaction
}
```

**Why:**

-   Ensures atomic state updates
-   Prevents orphaned states (e.g., synced but marked as failed)
-   Maintains data consistency

### 4. **Multi-Channel Alerting** ✅

**Channels:**

-   Email
-   Slack
-   Generic Webhook

**Thresholds:**

-   WARNING: >100 pending events
-   ERROR: >10 permanently failed events
-   Rate limit: Max 1 alert per 5 minutes

**Configuration:**

```env
ENABLE_EMAIL_ALERTS=true
ENABLE_SLACK_ALERTS=true
DLQ_WEBHOOK_URL=https://your-webhook-url.com
ADMIN_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### 5. **Comprehensive Admin Controls** ✅

**API Endpoints:**

#### Statistics & Monitoring

```http
GET /dlq/stats
# Returns: { status: 'healthy'|'degraded'|'unhealthy', pending, retrying, failed, success }
```

#### List & Filter Events

```http
GET /dlq?status=FAILED&tableName=products&page=1&limit=10
```

#### Manual Operations

```http
POST /dlq/:id/retry          # Retry single event
POST /dlq/:id/reset          # Reset retry count to 0
POST /dlq/:id/archive        # Mark as manually resolved
DELETE /dlq/:id              # Permanently delete
```

#### Bulk Operations

```http
POST /dlq/bulk/retry         # Retry multiple events
POST /dlq/bulk/archive       # Archive old events
DELETE /dlq/bulk/archived    # Clean up archived events
```

#### Alerting

```http
POST /dlq/alerts/check       # Manually trigger health check
POST /dlq/alerts/test        # Send test alert
```

### 6. **Event Status Lifecycle** ✅

```
PENDING → Event is waiting for retry (based on backoff)
  ↓
RETRYING → Currently being retried
  ↓
SUCCESS → Successfully processed
FAILED → Permanently failed (max retries exceeded)
ARCHIVED → Manually resolved by admin
```

### 7. **Error Classification** (Recommended)

**Retryable Errors:**

-   Network timeouts
-   Connection refused
-   Temporary service unavailability
-   Rate limiting (429)

**Non-Retryable Errors:**

-   Validation failures
-   Duplicate entries
-   Invalid data format
-   Authorization failures (403)

**Implementation:**

```typescript
if (isNonRetryableError(error)) {
	await dlqService.markAsFailed(eventId, "Non-retryable error");
} else {
	await dlqService.incrementRetryCount(eventId, error.message);
}
```

## Advanced Patterns

### 1. Circuit Breaker Pattern (Future Enhancement)

```typescript
class CircuitBreaker {
	private failureCount = 0;
	private state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN

	async execute(fn: Function) {
		if (this.state === "OPEN") {
			throw new Error("Circuit breaker is OPEN");
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onFailure() {
		this.failureCount++;
		if (this.failureCount >= threshold) {
			this.state = "OPEN";
			setTimeout(() => (this.state = "HALF_OPEN"), timeout);
		}
	}
}
```

### 2. Priority Queue (Future Enhancement)

Add priority levels to DLQ events:

```typescript
enum DlqPriority {
	LOW,
	NORMAL,
	HIGH,
	CRITICAL,
}

// Process CRITICAL events first, then HIGH, etc.
const events = await dlqRepository.find({
	where: { status: DlqStatus.PENDING },
	order: { priority: "DESC", createdAt: "ASC" },
});
```

### 3. Dead Letter Topic (Kafka-based DLQ)

Instead of database, use a Kafka topic:

```typescript
// When event fails
await kafkaProducer.send({
	topic: "dlq.events",
	messages: [
		{
			key: event.id,
			value: JSON.stringify(event),
			headers: {
				"x-retry-count": retryCount.toString(),
				"x-original-topic": originalTopic,
				"x-error-message": error.message,
			},
		},
	],
});

// DLQ Consumer
@Consumer({
	topics: ["dlq.events"],
	groupId: "dlq-retry-group",
})
class DlqConsumer {
	async consume(message) {
		const retryCount = parseInt(message.headers["x-retry-count"]);
		if (retryCount < maxRetries) {
			await delay(calculateBackoff(retryCount));
			await retryOriginalTopic(message);
		} else {
			await sendAlert("Event permanently failed");
		}
	}
}
```

## Monitoring & Observability

### Key Metrics to Track

1. **DLQ Size** - Total pending events
2. **Retry Success Rate** - `successCount / totalAttempted`
3. **Average Time in DLQ** - Time from creation to success
4. **Failed Event Rate** - Events that exhaust all retries
5. **Alert Frequency** - Number of alerts sent

### Dashboards

Create dashboards showing:

-   DLQ event count by status (line chart)
-   Retry success/failure rates (pie chart)
-   Events by table name (bar chart)
-   Time in DLQ histogram

### Logging Best Practices

```typescript
this.logger.log({
	message: "DLQ event processed",
	eventId,
	tableName,
	operation,
	retryCount,
	durationMs: Date.now() - startTime,
	success: true,
});
```

## Operational Procedures

### Daily Tasks

1. Check DLQ stats dashboard
2. Review failed events
3. Investigate patterns in failures

### Weekly Tasks

1. Archive old SUCCESS events
2. Review and resolve FAILED events
3. Analyze retry patterns and adjust backoff if needed

### Monthly Tasks

1. Delete archived events (cleanup)
2. Review alerting thresholds
3. Analyze DLQ trends and capacity planning

## Configuration

### Environment Variables

```env
# Alert Configuration
ENABLE_EMAIL_ALERTS=true
ENABLE_SLACK_ALERTS=false
DLQ_WEBHOOK_URL=https://your-webhook.com
ADMIN_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=

# DLQ Configuration (optional, has defaults)
DLQ_BASE_DELAY_MS=1000
DLQ_MAX_DELAY_MS=300000
DLQ_MAX_RETRIES=5
DLQ_ALERT_THRESHOLD_PENDING=100
DLQ_ALERT_THRESHOLD_FAILED=10
```

### Database Migration

Ensure the `dlq_events` table has proper indexes:

```sql
CREATE INDEX idx_dlq_status ON dlq_events(status);
CREATE INDEX idx_dlq_table_name ON dlq_events(table_name);
CREATE INDEX idx_dlq_created_at ON dlq_events(created_at);
CREATE INDEX idx_dlq_last_retry_at ON dlq_events(last_retry_at);
CREATE INDEX idx_dlq_status_created ON dlq_events(status, created_at);
```

## Testing

### Unit Tests

```typescript
describe("RetryService", () => {
	it("should retry event and return true on success", async () => {
		const success = await retryService.retryEvent(1);
		expect(success).toBe(true);
	});

	it("should rollback transaction on failure", async () => {
		mockSync.syncProductEvent.mockRejectedValue(new Error("Sync failed"));
		const success = await retryService.retryEvent(1);
		expect(success).toBe(false);
		// Verify event still in PENDING state
	});
});
```

### Integration Tests

```typescript
it("should process all pending events in batches", async () => {
	// Create 105 pending events
	await createDlqEvents(105);

	await retryService.autoRetryFailedEvents();

	const stats = await dlqService.getStats();
	expect(stats.pending + stats.success + stats.failed).toBe(105);
});
```

## Troubleshooting

### Issue: DLQ keeps growing

**Solution:** Check downstream service health, increase retry intervals, or add circuit breaker

### Issue: Alerts not being sent

**Solution:** Verify environment variables, check logs for webhook errors, test alerts manually

### Issue: Events stuck in RETRYING status

**Solution:** Likely a crashed retry process. Reset events to PENDING status

### Issue: High memory usage during retry

**Solution:** Reduce batch size, process fewer events per run

## Summary

✅ **Current Implementation Includes:**

-   Exponential backoff with jitter
-   Transactional retry for data consistency
-   Batch processing for scalability
-   Multi-channel alerting (email/Slack/webhook)
-   Comprehensive admin API
-   Automated health checks
-   Bulk operations support

🚀 **Future Enhancements:**

-   Circuit breaker pattern
-   Priority queue
-   Kafka-based DLQ topic
-   Real-time dashboard UI
-   Metrics/Prometheus integration
-   Configurable error classification

## References

-   [AWS SQS Dead Letter Queue](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)
-   [Azure Service Bus Dead-Letter Queues](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues)
-   [Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
-   [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
