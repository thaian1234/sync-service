# NestJS Core + CMS (Product Sync Only)

## Architecture

```ascii
┌─────────────────┐                              ┌─────────────────┐
│  Core Service   │──── CRUD ────>│MySQL Core│   │  CMS Service    │
│    (NestJS)     │                │ products │   │   (NestJS)      │
│   REST API      │                └────┬─────┘   │ Consumer + API  │
└─────────────────┘                     │         └────────┬────────┘
                                    Binlog                  │
                                        │                   │
                                   ┌────▼──────┐           │
                                   │ Debezium  │           │
                                   │ Connector │           │
                                   └────┬──────┘           │
                                        │                   │
                                      Events                │
                                        │                   │
                                   ┌────▼──────┐           │
                                   │   Kafka   │           │
                                   │ products. │           │
                                   │  events   │           │
                                   └────┬──────┘           │
                                        │                   │
                                     Consume                │
                                        └───────────────────┘
                                                            │
                                                       ┌────▼─────┐
                                                       │MySQL CMS │
                                                       │cms_products│
                                                       └──────────┘
```

## Features

- Product synchronization from Core service to CMS service.
- Real-time data capture using Debezium and Kafka.
- Idempotent consumer to prevent duplicate processing.
- Dead Letter Queue (DLQ) for failed events.
- Automatic and manual retry mechanism for failed events.
- REST APIs for both Core and CMS services.
- Dockerized setup for easy development and deployment.

## Prerequisites

- Docker
- Docker Compose
- `make` command

## Quick Start

1.  **Build and start all services:**
    ```bash
    make quickstart
    ```
    This command will build the images, start the services, and deploy the Debezium connector. It might take a few minutes.

2.  **Check service health:**
    ```bash
    make health
    ```
    Ensure all services are `healthy`.

3.  **Test the synchronization:**
    Create a new product in the Core service:
    ```bash
    curl -X POST http://localhost:3000/products \
      -H "Content-Type: application/json" \
      -d 
      {
        "name": "iPhone 15 Pro",
        "description": "Latest Apple smartphone",
        "price": 999.99,
        "stock": 100,
        "category": "Electronics"
      }
    ```
    After a few seconds, check if the product is synced to the CMS service:
    ```bash
    curl http://localhost:3002/products/core/1
    ```

## Service Ports

| Service         | Port   | URL                               |
| --------------- | ------ | --------------------------------- |
| Core Service    | 3000   | http://localhost:3000             |
| CMS Service     | 3002   | http://localhost:3002             |
| Kafka UI        | 8080   | http://localhost:8080             |
| MySQL Core      | 3306   | (localhost)                       |
| MySQL CMS       | 3307   | (localhost)                       |
| Kafka Connect   | 8083   | http://localhost:8083             |

## API Examples

### Core Service

-   **Create Product:** `curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"Test","price":10,"stock":100}'`
-   **Get All Products:** `curl http://localhost:3000/products`
-   **Update Product:** `curl -X PUT http://localhost:3000/products/1 -H "Content-Type: application/json" -d '{"price":12}'`
-   **Delete Product:** `curl -X DELETE http://localhost:3000/products/1`

### CMS Service

-   **Get All Products:** `curl http://localhost:3002/products`
-   **Get Product by Core ID:** `curl http://localhost:3002/products/core/1`
-   **Get DLQ Events:** `curl http://localhost:3002/dlq`
-   **Retry DLQ Event:** `curl -X POST http://localhost:3002/dlq/1/retry`

## Monitoring

-   **Kafka UI:** [http://localhost:8080](http://localhost:8080)
-   **Core Service API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
-   **CMS Service API Docs:** [http://localhost:3002/api-docs](http://localhost:3002/api-docs)

## Troubleshooting

-   Use `make logs-core`, `make logs-cms`, etc. to check the logs of individual services.
-   Use `make health` to check the health status of all services.
-   If Debezium connector fails, check the `kafka-connect` logs.

## Command Reference

Run `make help` to see the full list of available commands.

```