# Docker Compose Multi-Environment Setup

This project uses a multi-file Docker Compose configuration to manage different environments with varying service requirements.

## Architecture Overview

-   **compose.base.yaml** - Base file containing Kafka infrastructure in KRaft mode (shared across all environments)
-   **compose.{env}.yaml** - Environment-specific service definitions (dev, test, prod)
-   **.env.{env}** - Environment-specific configuration values

### Kafka KRaft Mode

This setup uses **Kafka KRaft mode** (Kafka Raft) instead of Zookeeper:
- **Better Performance** - Reduced latency and improved throughput
- **Simpler Architecture** - One less service to manage and monitor
- **Lower Resource Usage** - No separate Zookeeper container required
- **Faster Startup** - Quicker cluster initialization
- **Future-Proof** - Zookeeper is deprecated in Kafka 3.x+

## Environment Configurations

### Production

**Services:** kafka (KRaft mode), kafka-connect, kafka-ui

Production assumes external MySQL, Redis, and application services (e.g., managed databases).
Kafka runs in KRaft mode without Zookeeper for better performance and resource utilization.

```sh
docker compose --env-file .env.prod -f compose.base.yaml -f compose.prod.yaml up -d --build
```

### Development

**Services:** kafka (KRaft mode), kafka-connect, kafka-ui, mysql-core, mysql-cms, redis, core-service, cms-service

Full local development stack with all services. Kafka runs in KRaft mode without Zookeeper.

```sh
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml up -d --build
```

### Test/Staging

**Services:** kafka (KRaft mode), kafka-connect, kafka-ui, mysql-cms, redis, cms-service

Test environment with Kafka infrastructure and CMS service for integration testing. Kafka runs in KRaft mode without Zookeeper.

```sh
docker compose --env-file .env.test -f compose.base.yaml -f compose.test.yaml up -d --build
```

## Common Commands

### Start services

```sh
# Development
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml up -d --build

# Production
docker compose --env-file .env.prod -f compose.base.yaml -f compose.prod.yaml up -d --build

# Test/Staging
docker compose --env-file .env.test -f compose.base.yaml -f compose.test.yaml up -d --build
```

### Stop services

```sh
# Replace --env-file and -f flags with your target environment
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml down
```

### View logs

```sh
# All services
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml logs -f

# Specific service
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml logs -f cms-service
```

### Rebuild specific service

```sh
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml up -d --build cms-service
```

### List running services

```sh
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml ps
```

## Service Access

### Development URLs

-   Kafka UI: http://localhost:8080
-   Kafka Connect: http://localhost:8083
-   Core Service: http://localhost:3000
-   CMS Service: http://localhost:3002
-   Redis: localhost:6379
-   MySQL Core: localhost:3308
-   MySQL CMS: localhost:3307

### Database Connections

```sh
# MySQL Core (dev only)
mysql -h 127.0.0.1 -P 3308 -u user -p
# Password: password (from .env.dev)

# MySQL CMS (dev/test)
mysql -h 127.0.0.1 -P 3307 -u user -p
# Password: password (from .env.dev)
```

## Environment Variables

### Root Environment Files (`.env.{env}`)

Located at project root, these files contain infrastructure configuration:

-   **MySQL credentials** - Root and user passwords, database names
-   **Service ports** - External port mappings
-   **Redis configuration** - Memory limits, TTL, database selection
-   **Connection pools** - Database connection pool sizes

### Service-Specific Environment Files

Application services have two environment configurations:

**For Docker Compose (`.env.docker`):**

-   **cms-service/.env.docker** - CMS service config using Docker service names
-   **core-service/.env.docker** - Core service config using Docker service names

These files use Docker internal networking:

-   Database hosts: `mysql-cms`, `mysql-core`
-   Kafka broker: `kafka:9092` (internal port)
-   Redis host: `redis`

**For Local Development (`.env`):**

-   **cms-service/.env** - CMS service config using localhost
-   **core-service/.env** - Core service config using localhost

These files use localhost connections:

-   Database hosts: `localhost`
-   Kafka broker: `localhost:9093` (exposed port)
-   Redis host: `localhost`
-   Ports: Match the exposed ports from root `.env.dev` (e.g., 3307, 3308)

The compose override files use `env_file: .env.docker` to load the Docker-specific configuration when running in containers.

### Security Notes

-   All `.env` files are in `.gitignore` and should NEVER be committed
-   Production passwords in `.env.prod` are placeholders - replace with secure values
-   Service-specific `.env` files should also be protected and not committed
-   Consider using Docker secrets or vault solutions for production credentials

## File Structure

```
sync/
├── compose.base.yaml                 # Base Kafka infrastructure (KRaft mode)
├── compose.dev.yaml                  # Development services
├── compose.prod.yaml                 # Production services (empty)
├── compose.test.yaml                 # Test/staging services
├── .env.dev                          # Development infrastructure config
├── .env.prod                         # Production infrastructure config (template)
├── .env.test                         # Test/staging infrastructure config
├── databases/
│   ├── init-core.sql                 # Core DB initialization
│   └── init-cms.sql                  # CMS DB initialization
├── core-service/
│   ├── .env                          # Local development config (localhost)
│   ├── .env.docker                   # Docker Compose config (service names)
│   └── Dockerfile
└── cms-service/
    ├── .env                          # Local development config (localhost)
    ├── .env.docker                   # Docker Compose config (service names)
    └── Dockerfile
```

## Migration from docker-compose.yml

The original `docker-compose.yml` is preserved for reference. To migrate:

1. Use the new environment-specific commands above
2. Update any scripts or CI/CD pipelines to use the new file structure
3. Copy production credentials from secure storage to `.env.prod`

## Troubleshooting

### Services won't start

```sh
# Check service health
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml ps

# View detailed logs
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml logs
```

### Port conflicts

Check if ports are already in use:

```sh
# Windows
netstat -ano | findstr :3307

# Linux/Mac
lsof -i :3307
```

Update port mappings in the appropriate `.env.{env}` file.

### Volume data persistence

Volumes are preserved between restarts. To reset:

```sh
# Warning: This deletes all data
docker compose --env-file .env.dev -f compose.base.yaml -f compose.dev.yaml down -v
```

## Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong passwords in production** - Replace all CHANGE_ME placeholders
3. **Test environment changes locally first** - Use `.env.dev` before modifying other environments
4. **Keep override files DRY** - Common configs go in `compose.yaml`
5. **Document custom changes** - Update this file when adding new services or configurations
