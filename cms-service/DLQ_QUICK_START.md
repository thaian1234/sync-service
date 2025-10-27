# DLQ System - Quick Start Guide

## What We Built

A **production-ready Dead Letter Queue (DLQ) system** with:

✅ **Non-blocking retry** - Events are retried in background without blocking main flow
✅ **Transactional safety** - All state changes are atomic
✅ **Multi-channel alerts** - Email, Slack, and webhook notifications
✅ **Admin controls** - Comprehensive REST API for manual intervention
✅ **Batch processing** - Handles any number of events efficiently

## Quick Setup

### 1. Environment Configuration

Add to your `.env` file:

```env
# Alert Channels (enable what you need)
ENABLE_EMAIL_ALERTS=true
ENABLE_SLACK_ALERTS=false
DLQ_WEBHOOK_URL=https://your-webhook.com/dlq-alerts

# Email Configuration (if using email alerts)
ADMIN_EMAIL=admin@example.com

# Slack Configuration (if using Slack alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2. Database Migration

The DLQ table should already exist. Verify with:

```sql
SELECT * FROM dlq_events LIMIT 1;
```

### 3. Module Registration

Ensure these are registered in your `AppModule` or `DlqModule`:

```typescript
import { DlqAlertService, EmailAlertChannel, SlackAlertChannel, WebhookAlertChannel } from './kafka/services/dlq-alert.service';

@Module({
  providers: [
    RetryService,
    DlqService,
    DlqAlertService,
    EmailAlertChannel,
    SlackAlertChannel,
    WebhookAlertChannel,
  ],
  // ...
})
```

## API Endpoints

### Check DLQ Health

```bash
curl http://localhost:3000/dlq/stats
```

**Response:**
```json
{
  "status": "healthy",
  "pending": 5,
  "retrying": 2,
  "failed": 1,
  "success": 1000,
  "total": 1008
}
```

### List Failed Events

```bash
curl "http://localhost:3000/dlq?status=FAILED&page=1&limit=10"
```

### Manual Retry Single Event

```bash
curl -X POST http://localhost:3000/dlq/123/retry
```

### Bulk Retry All Products

```bash
curl -X POST http://localhost:3000/dlq/bulk/retry \
  -H "Content-Type: application/json" \
  -d '{"tableName": "products", "limit": 100}'
```

### Archive Old SUCCESS Events

```bash
curl -X POST http://localhost:3000/dlq/bulk/archive \
  -H "Content-Type: application/json" \
  -d '{"status": "SUCCESS", "olderThan": "2024-01-01T00:00:00Z"}'
```

### Test Alerts

```bash
curl -X POST http://localhost:3000/dlq/alerts/test
```

## Common Operations

### Scenario 1: Too Many Pending Events

**Problem:** DLQ has 500+ pending events

**Solution:**
1. Check if downstream service is down
2. Manually trigger bulk retry:
   ```bash
   curl -X POST http://localhost:3000/dlq/bulk/retry \
     -H "Content-Type: application/json" \
     -d '{"status": "PENDING", "limit": 500}'
   ```

### Scenario 2: Events Keep Failing

**Problem:** Same events failing repeatedly

**Solution:**
1. Get failed events: `GET /dlq?status=FAILED`
2. Investigate error messages in `errorMessage` field
3. Fix root cause
4. Reset and retry: `POST /dlq/:id/reset` then `POST /dlq/:id/retry`

### Scenario 3: Clean Up Old Events

**Problem:** Database growing with old SUCCESS events

**Solution:**
```bash
# Archive events older than 30 days
curl -X POST http://localhost:3000/dlq/bulk/archive \
  -H "Content-Type: application/json" \
  -d '{"status": "SUCCESS", "olderThan": "2024-10-01T00:00:00Z"}'

# Delete archived events
curl -X DELETE http://localhost:3000/dlq/bulk/archived
```

### Scenario 4: Manual Resolution

**Problem:** Event can't be retried automatically (data issue)

**Solution:**
1. Fix data manually in destination system
2. Archive the DLQ event:
   ```bash
   curl -X POST http://localhost:3000/dlq/123/archive
   ```

## How It Works

### Automatic Retry Flow

```
1. Event fails during processing
   ↓
2. Sent to DLQ with status=PENDING
   ↓
3. Cron job runs every 10-30 seconds
   ↓
4. Calculates exponential backoff: delay = 1s * 2^retryCount
   ↓
5. If enough time passed, retry the event
   ↓
6a. SUCCESS → Mark as SUCCESS
6b. FAILURE → Increment retryCount, back to PENDING
   ↓
7. If retryCount >= maxRetries → Mark as FAILED, send alert
```

### Retry Delays

| Retry # | Base Delay | Max Delay |
|---------|-----------|-----------|
| 1       | 1s        | 1s        |
| 2       | 2s        | 2s        |
| 3       | 4s        | 4s        |
| 4       | 8s        | 8s        |
| 5       | 16s       | 16s       |
| 6       | 32s       | 32s       |
| 7+      | 64s+      | 300s (5min) |

*Note: Actual delays include +/- 30% jitter to prevent thundering herd*

## Monitoring

### Metrics to Watch

1. **Pending Count** - Should stay low (< 100)
2. **Failed Count** - Should be investigated immediately
3. **Success Rate** - Target > 95%
4. **Retry Distribution** - Most events should succeed within 2-3 retries

### Alert Thresholds

- **WARNING**: > 100 pending events
- **ERROR**: > 10 permanently failed events
- **Rate Limit**: Max 1 alert per 5 minutes

## Troubleshooting

### Events Stuck in RETRYING

**Cause:** Application crashed during retry
**Fix:**
```sql
UPDATE dlq_events SET status = 'PENDING' WHERE status = 'RETRYING';
```

### No Alerts Being Sent

**Check:**
1. Environment variables are set correctly
2. Webhook URL is reachable
3. Test manually: `POST /dlq/alerts/test`

### High Memory Usage

**Fix:**
- Reduce batch size in `retry.service.ts` (default: 100)
- Increase cron interval from EVERY_10_SECONDS to EVERY_30_SECONDS

## Best Practices

### DO ✅

- Monitor DLQ size daily
- Investigate patterns in failed events
- Archive old SUCCESS events monthly
- Test alerts after deployment
- Use bulk operations for efficiency

### DON'T ❌

- Don't delete FAILED events without investigation
- Don't bypass DLQ for "important" events
- Don't ignore WARNING alerts
- Don't set retry intervals too low (causes load)
- Don't manually update DLQ status without understanding flow

## Architecture Diagram

```
┌─────────────────┐
│  Kafka Event    │
│   Processing    │
└────────┬────────┘
         │
    [Fails]
         │
         ↓
┌─────────────────┐
│   DLQ Service   │
│  (Save Event)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  DLQ Database   │
│  status=PENDING │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Retry Service  │
│  (Cron Every    │
│   10-30 sec)    │
└────────┬────────┘
         │
    [Process Batch]
         │
    ┌────┴────┐
    │         │
  Success   Failure
    │         │
    ↓         ↓
 SUCCESS   PENDING
           (retry++)
              │
        [Max Retries?]
              │
              ↓
           FAILED
              │
              ↓
      ┌──────────────┐
      │ Alert Service│
      │ (Email/Slack)│
      └──────────────┘
              │
              ↓
         [Admin]
```

## Next Steps

1. ✅ Configure alert channels in `.env`
2. ✅ Test the system: `POST /dlq/alerts/test`
3. ✅ Monitor `/dlq/stats` endpoint
4. ✅ Set up daily DLQ review process
5. 🚀 Optional: Build a frontend dashboard

For detailed information, see `DLQ_BEST_PRACTICES.md`
