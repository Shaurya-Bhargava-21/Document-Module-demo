# Document Management API

A REST API for managing documents and their versions, built with **Fastify**, **TypeScript**, **TypeORM**, **PostgreSQL**, and **Redis**.

---

## Tech Stack

- **Runtime** — Node.js with TypeScript
- **Framework** — Fastify with Zod type provider
- **Database** — PostgreSQL via TypeORM
- **Cache** — Redis
- **Validation** — Zod
- **API Docs** — Swagger UI (`/docs`)

---

## Project Structure

```
src/
├── app/
│   ├── decorators/
│   │   ├── cacheGet.ts          # Caches method results in Redis
│   │   ├── cachePurge.ts        # Invalidates Redis cache keys on mutation
│   │   └── performanceTracker.ts # Logs method execution time
│   ├── persistence/
│   │   ├── entities/
│   │   │   ├── DocumentEntity.ts
│   │   │   └── DocumentVersionEntity.ts
│   │   ├── migrations/
│   │   │   └── 1770198074143-InitialSchema.ts
│   │   └── data-source.ts
│   ├── repos/
│   │   ├── InMemoryDocRepo.ts   # In-memory repo for testing/local dev
│   │   └── TypeOrmDocRepo.ts    # Real Postgres repo
│   ├── services/
│   │   ├── DocumentService.ts   # Real service (Postgres + Redis)
│   │   └── InMemoryDocService.ts # In-memory service for testing
│   └── validators/
│       └── DocumentValidators.ts
├── contracts/
│   ├── errors/
│   │   ├── DocumentError.ts
│   │   └── ServiceError.ts
│   ├── services/
│   │   └── IDocumentService.ts
│   └── states/
│       └── document.ts          # All types, interfaces, and enums
└── entry/
    ├── routes/
    │   └── documents.ts
    ├── index.ts
    ├── redis.ts
    └── server.ts
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

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
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=documents_db

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Run migrations

```bash
npm run migration:run
```

### 4. Start the server

```bash
npm run dev     # development
npm run start   # production
```

Server runs on **http://localhost:4000**
Swagger docs at **http://localhost:4000/docs**

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
- `DRAFT` — document has been archived (not editable, not accessible)
- `DELETED` — document is soft deleted and will not appear in any queries

---

## Caching

Redis caching is applied via decorators on the service layer.

| Method | Cache TTL | Invalidated by |
|--------|-----------|----------------|
| `getDocument` | 300s | `addVersion`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |
| `searchDocument` | 120s | `createDocument`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |
| `listVersion` | 300s | `addVersion`, `archiveDocument`, `unarchiveDocument`, `softDeleteDocument` |

Cache keys follow the format: `ClassName:methodName:[args]`

If Redis is unavailable, the app falls back to hitting the database directly — no requests will fail due to cache errors.

---

## Document Types

Supported file types:

- `PDF`
- `JPG`
- `PNG`
- `TXT`

---

## Switching to In-Memory Mode

For local development without a database or Redis, swap the service in `entry/routes/documents.ts`:

```typescript
// Use this for local dev / testing
service = new InMemoryDocService();

// Use this for real Postgres + Redis
service = new DocumentService();
```

---

## Running Migrations

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate --name=MigrationName
```
