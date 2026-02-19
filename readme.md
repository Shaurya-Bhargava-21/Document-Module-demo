# Document Management API

A REST API for managing documents and their versions, built with **Fastify**, **TypeScript**, **TypeORM**, **PostgreSQL**, **Redis**, and **Kafka**.

---

## Tech Stack

- **Runtime** — Node.js with TypeScript
- **Framework** — Fastify with Zod type provider
- **Database** — PostgreSQL via TypeORM
- **Cache** — Redis
- **Message Broker** — Apache Kafka
- **Validation** — Zod
- **API Docs** — Swagger UI (`/docs`)

---

## Project Structure

```
src/
├── app/
│   ├── controllers/
│   │   └── DocumentController.ts       # Handles HTTP req/res, delegates to service
│   ├── decorators/
│   │   ├── cacheGet.ts                 # Caches method results in Redis
│   │   ├── cachePurge.ts               # Invalidates Redis cache keys on mutation
│   │   └── performanceTracker.ts       # Logs method execution time
│   ├── listeners/
│   │   ├── DocumentListener.ts         # Kafka consumer for document events
│   │   └── VersionListener.ts          # Kafka consumer for version events
│   ├── persistence/
│   │   ├── entities/
│   │   │   ├── DocumentEntity.ts
│   │   │   └── DocumentVersionEntity.ts
│   │   ├── migrations/
│   │   │   ├── 1770198074143-InitialSchema.ts
│   │   │   └── 1771397554241-AddDocumentVersionForeignKey.ts
│   │   └── data-source.ts
│   ├── producers/
│   │   ├── DocumentProducer.ts         # Publishes events to Kafka topics
│   │   └── topics.ts                   # Kafka topic name constants (enum)
│   ├── repos/
│   │   ├── InMemoryDocRepo.ts          # In-memory repo for local dev/testing
│   │   └── TypeOrmDocRepo.ts           # Real PostgreSQL repo via TypeORM
│   └── services/
│       ├── ArchiveProcessingService.ts
│       ├── DeleteProcessingService.ts
│       ├── DocumentProcessingService.ts
│       ├── DocumentService.ts          # Real service (PostgreSQL + Redis + Kafka)
│       ├── InMemoryDocService.ts       # In-memory service for local dev/testing
│       ├── UnArchiveProcessingService.ts
│       └── VersionProcessingService.ts
├── contracts/
│   ├── errors/
│   │   ├── DocumentError.ts
│   │   └── ServiceError.ts
│   ├── services/
│   │   └── IDocumentService.ts         # Interface implemented by both services
│   ├── states/
│   │   └── document.ts                 # All types, interfaces, and enums
│   └── validators/
│       └── DocumentValidators.ts       # Zod schemas for all commands
└── entry/
    ├── routes/
    │   └── documentRoutes.ts
    ├── index.ts
    ├── kafka.ts                        # Kafka client, producer, consumers
    ├── redis.ts                        # Redis client
    └── server.ts                       # App entry point, boots all services
```

---

## Prerequisites

- Node.js 18+
- Docker and Docker Compose

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=YourUser
DB_PASSWORD=YourPassword
DB_NAME=YourDbName

REDIS_HOST=localhost
REDIS_PORT=6379

KAFKA_CLIENT_ID=document-service
KAFKA_BROKER=localhost:9092
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, Kafka, Zookeeper, and their web UIs.

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the server

```bash
npm run dev     # development — runs index.ts via tsx + nodemon
npm run start   # production — runs server.ts via tsx + nodemon
```

Server runs on **http://localhost:4000**  
Swagger docs at **http://localhost:4000/docs**

---

## Infrastructure (Docker)

| Service | Purpose | URL |
|---------|---------|-----|
| PostgreSQL | Primary database | `localhost:5433` |
| Redis | Cache layer | `localhost:6379` |
| RedisInsight | Redis web UI | `http://localhost:8001` |
| Kafka | Message broker | `localhost:9092` |
| Zookeeper | Kafka coordinator | `localhost:2181` |
| Kafdrop | Kafka web UI | `http://localhost:9000` |

---

## API Endpoints

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents` | Create a new document |
| `GET` | `/documents` | Search/list documents |
| `GET` | `/documents/:id` | Get a document by ID |
| `PATCH` | `/documents/:documentId/archive` | Archive a document |
| `PATCH` | `/documents/:documentId/unarchive` | Unarchive a document |
| `DELETE` | `/documents/:documentId` | Soft delete a document |

### Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/:id/versions` | Add a new version to a document |
| `GET` | `/documents/:documentId/versions` | List all versions of a document |

---

## Document Lifecycle

```
Created (PUBLISHED, active: true)
    │
    ├──► Archive  →  DRAFT, active: false
    │        │
    │        └──► Unarchive  →  PUBLISHED, active: true
    │
    └──► Soft Delete  →  DELETED, active: false  (irreversible)
```

**Status meanings:**
- `PUBLISHED` — document is active and accessible
- `DRAFT` — document is archived (not editable)
- `DELETED` — document is soft deleted, excluded from all queries (data preserved in DB)

---

## Document Types

- `PDF`
- `JPG`
- `PNG`
- `TXT`

---

## Kafka Events

Every mutation publishes an event to Kafka for async processing.

| Topic | Published when | Consumer group |
|-------|---------------|----------------|
| `document.created` | Document is created | `document-processor` |
| `document.archived` | Document is archived | `document-processor` |
| `document.unarchived` | Document is unarchived | `document-processor` |
| `document.deleted` | Document is soft deleted | `document-processor` |
| `version.added` | A new version is added | `version-processor` |

Processing services currently log event details to the console. They are the extension point for future side effects — search indexing, notifications, webhooks, analytics, etc.

---

## Caching

Redis caching is applied via TypeScript decorators on the service layer.

| Method | TTL | Invalidated by |
|--------|-----|----------------|
| `getDocument` | 300s | `addVersion`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |
| `searchDocument` | 120s | `createDocument`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |
| `listVersion` | 300s | `addVersion`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |

Cache keys follow the format: `ClassName:methodName:[args]`

If Redis is unavailable, the app falls back to the database — no requests fail due to cache errors.

---

## Switching to In-Memory Mode

For local development without Docker, swap the service in `entry/routes/documentRoutes.ts`:

```typescript
// local dev / testing — no DB, Redis, or Kafka needed
service = new InMemoryDocService();

// production — PostgreSQL + Redis + Kafka
service = new DocumentService();
```

---

## Running Migrations

```bash
# Create a blank migration
npm run migration:create -- src/app/persistence/migrations/MigrationName

# Generate a migration based on entity changes
npm run migration:generate -- src/app/persistence/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show
```