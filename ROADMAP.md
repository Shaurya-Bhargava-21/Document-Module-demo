# Roadmap: Completing Stage 1 & Stage 2

This picks up from where you currently are and walks you to the end of Stage 2.

---

## Where you are now

**Done:**
- `DocumentState`, `DocumentVersionState`, `CreateDocumentCommand`, `GetDocumentCommand`, `SearchDocumentCommand` DTOs exist
- `IDocumentService` has `createDocument`, `getDocument`, `searchDocument`
- `DocumentService` implements those three methods using an in-memory array
- TypeORM entities (`DocumentEntity`, `DocumentVersionEntity`) exist with basic columns and a one-to-many relation
- `AppDataSource` connects to Postgres (`demofordocument`)
- `src/index.ts` has a commented-out demo and a DB init block

**Not done (Stage 1):**
- Status enum is wrong (`DRAFT/PUBLISHED` instead of `active/archived/deleted`)
- No `addVersion`, `archiveDocument`, `softDeleteDocument`, `listVersions` methods
- No input validation at service boundary
- No standard error shape
- No repository interface — service stores data directly in an array
- Search only filters by title, ignores `type`, `status`

**Not done (Stage 2):**
- No repository interface or implementations
- No migrations (using `synchronize: true`)
- Missing DB constraints (unique on `(document_id, version)`, index on `updated_at`)
- Hardcoded DB credentials (dotenv not wired)

---

## Step 1 — Fix the status enum

Your `DocStatusType` has `DRAFT | PUBLISHED`. The onboarding guide requires `active | archived | deleted`.

**File:** `src/contracts/states/document.ts`

- Rename or replace `DocStatusType` → values: `ACTIVE`, `ARCHIVED`, `DELETED`
- Remove the `active: boolean` field from `DocumentState` — status alone covers this (a document is "active" when `status === ACTIVE`)
- Update `SearchDocumentCommand` accordingly (drop the `active?` filter, keep `status?`)

**Then:** update `DocumentService.createDocument()` to default status to `ACTIVE` instead of `DRAFT`.

---

## Step 2 — Add missing DTOs and error shape

**File:** `src/contracts/states/document.ts`

Add these:

```ts
// Command to add a new version
interface AddVersionCommand {
  documentId: number;
  content: string;
}

// Wrapper for search results with pagination metadata
interface SearchDocumentsResult {
  documents: DocumentState[];
  total: number;
  limit: number;
  offset: number;
}

// Standard error shape (use this everywhere instead of plain Error)
interface ServiceError {
  code: string;       // e.g. "DOCUMENT_NOT_FOUND", "INVALID_INPUT"
  message: string;
  details?: unknown;
}
```

Also add `versions?: DocumentVersionState[]` to `DocumentState` so `getDocument` can return the document with its versions.

Export everything.

---

## Step 3 — Define the repository interface

This is the key architectural piece you're missing. The service should call a repo interface, not manage an array directly.

**Create file:** `src/repos/IDocumentRepo.ts`

Define methods the service needs from storage:

```ts
interface IDocumentRepo {
  create(doc: CreateDocumentCommand): Promise<DocumentState>;
  getById(id: number): Promise<DocumentState | null>;
  update(id: number, fields: Partial<DocumentState>): Promise<DocumentState>;
  search(command: SearchDocumentCommand): Promise<{ documents: DocumentState[]; total: number }>;
  addVersion(documentId: number, version: DocumentVersionState): Promise<DocumentVersionState>;
  listVersions(documentId: number): Promise<DocumentVersionState[]>;
  getLatestVersionNumber(documentId: number): Promise<number>;
}
```

Keep it minimal — only what the service actually needs.

---

## Step 4 — Implement the in-memory repo

**Create file:** `src/repos/InMemoryDocumentRepo.ts`

Move the array + idCounter logic out of `DocumentService` and into this class. It implements `IDocumentRepo`. Store documents and versions in two separate arrays (or Maps).

Key points:
- `search()` must filter by `query`, `type`, and `status`, then apply `limit`/`offset`, and return `total` (count before pagination)
- `getLatestVersionNumber()` returns 0 if no versions exist
- `addVersion()` stores the version object

---

## Step 5 — Add the missing service methods

**File:** `src/services/DocumentService.ts`

Refactor the constructor to accept an `IDocumentRepo` instead of owning storage:

```ts
class DocumentService implements IDocumentService {
  constructor(private repo: IDocumentRepo) {}
  ...
}
```

Then implement the missing methods:

1. **`addVersion(command: AddVersionCommand): Promise<DocumentVersionState>`**
   - Validate: `documentId` and `content` must be present
   - Get document from repo → error if not found
   - Check status: if `ARCHIVED` or `DELETED`, throw error (business rule)
   - Get latest version number from repo → new version = latest + 1
   - Store via `repo.addVersion()`

2. **`archiveDocument(id: number): Promise<DocumentState>`**
   - Get document → error if not found
   - If already archived or deleted, throw error
   - Update status to `ARCHIVED` via `repo.update()`

3. **`softDeleteDocument(id: number): Promise<DocumentState>`**
   - Get document → error if not found
   - If already deleted, throw error
   - Update status to `DELETED` via `repo.update()`

4. **`listVersions(documentId: number): Promise<DocumentVersionState[]>`**
   - Check document exists → error if not
   - Return `repo.listVersions(documentId)`

5. **Fix `getDocument`** — also attach versions (or latest version) to the returned state

6. **Fix `searchDocument`** — return `SearchDocumentsResult` (with total count), delegate filtering to repo

---

## Step 6 — Add input validation at service boundary

The onboarding guide says this is non-negotiable. Every public method must validate its inputs before doing anything.

**Option A (recommended):** Install Zod and create schemas in `src/validators/`.

**Option B (simpler):** Write manual checks at the top of each service method.

What to validate:
- `createDocument`: `title` is non-empty string, `type` is valid `DocType`
- `addVersion`: `documentId` is positive number, `content` is non-empty string
- `getDocument`: `id` is positive number
- `searchDocument`: `limit` > 0, `offset` >= 0, `type`/`status` are valid enum values if provided
- `archiveDocument` / `softDeleteDocument`: `id` is positive number

On validation failure, throw/return your `ServiceError` with `code: "INVALID_INPUT"`.

---

## Step 7 — Update IDocumentService and wire up index.ts

**File:** `src/contracts/services/IDocumentService.ts`

Add the missing method signatures:
- `addVersion(command: AddVersionCommand): Promise<DocumentVersionState>`
- `archiveDocument(id: number): Promise<DocumentState>`
- `softDeleteDocument(id: number): Promise<DocumentState>`
- `listVersions(documentId: number): Promise<DocumentVersionState[]>`
- Update `searchDocument` return type to `Promise<SearchDocumentsResult>`

**File:** `src/index.ts`

Write a Stage 1 runner that demonstrates **every flow**:
1. Create a document
2. Add version v1, v2
3. Get document (should show versions)
4. Search with pagination
5. Archive the document
6. Try adding a version → should fail (business rule)
7. Soft-delete another document
8. List versions

Print results to console so you can visually verify.

---

**At this point Stage 1 is complete.** Everything runs from the CLI with no database.

---

## Step 8 — Fix TypeORM entities and add constraints

**File:** `src/persistence/entities/DocumentEntity.ts`

- Change the `status` column to use your updated enum (`ACTIVE/ARCHIVED/DELETED`)
- Remove `active` column (status covers it)
- Add index on `updatedAt`:
  ```ts
  @Index()
  @UpdateDateColumn()
  updatedAt: Date;
  ```

**File:** `src/persistence/entities/DocumentVersionEntity.ts`

- Add explicit `documentId` column (foreign key)
- Add unique constraint on `(documentId, version)`:
  ```ts
  @Entity("documentversions")
  @Unique(["documentId", "version"])
  export class DocumentVersionEntity { ... }
  ```
- Add `@JoinColumn({ name: "documentId" })` to the `@ManyToOne` relation

**Delete:** `src/persistence/entities/User.ts` — it's not part of the requirements and unused.

---

## Step 9 — Set up migrations

**File:** `src/persistence/data-source.ts`

- Turn off `synchronize` (`synchronize: false`)
- Add migration path:
  ```ts
  migrations: ["src/persistence/migrations/*.ts"]
  ```
- Move credentials to environment variables using dotenv:
  ```ts
  import "dotenv/config";
  // then use process.env.DB_HOST, process.env.DB_PASSWORD, etc.
  ```
- Create a `.env` file (and add `.env` to `.gitignore`)

**Generate your first migration:**
```bash
npx typeorm migration:generate src/persistence/migrations/InitialSchema -d src/persistence/data-source.ts
```

If that doesn't work with ESM, use `tsx`:
```bash
npx tsx node_modules/typeorm/cli.js migration:generate src/persistence/migrations/InitialSchema -d src/persistence/data-source.ts
```

**Run the migration:**
```bash
npx tsx node_modules/typeorm/cli.js migration:run -d src/persistence/data-source.ts
```

Verify the tables, constraints, and indexes exist in Postgres.

---

## Step 10 — Implement the TypeORM repo

**Create file:** `src/repos/TypeORMDocumentRepo.ts`

This class implements `IDocumentRepo` using TypeORM's `Repository` or `DataSource.getRepository()`.

Key mapping work:
- Convert between your DTOs (`DocumentState`) and entities (`DocumentEntity`) — keep this mapping inside the repo, not in the service
- Use TypeORM's `QueryBuilder` or `find` options for search with filters + pagination
- For `total` count in search, use `getManyAndCount()` or a separate count query

---

## Step 11 — Wire up and test Stage 2

**File:** `src/index.ts`

Write a Stage 2 runner:

```ts
// Initialize DB
await AppDataSource.initialize();

// Create repo backed by TypeORM
const repo = new TypeORMDocumentRepo(AppDataSource);
const service = new DocumentService(repo);

// Run the same demo flows as Stage 1, but now hitting Postgres
```

Verify:
- Documents appear in the `documents` table
- Versions appear in `documentversions` with correct foreign keys
- Search with filters returns correct results
- Archive/delete status changes persist
- The unique constraint on `(documentId, version)` rejects duplicates

**Swap test:** Change one line to use `InMemoryDocumentRepo` instead — everything should still work. This proves your repo abstraction is clean.

---

## Checklist

### Stage 1
- [ ] Status enum fixed to `ACTIVE / ARCHIVED / DELETED`
- [ ] `active` boolean removed from `DocumentState`
- [ ] `AddVersionCommand`, `SearchDocumentsResult`, `ServiceError` DTOs added
- [ ] `IDocumentRepo` interface defined
- [ ] `InMemoryDocumentRepo` implemented
- [ ] `DocumentService` refactored to use `IDocumentRepo`
- [ ] `addVersion` implemented with version auto-increment
- [ ] `archiveDocument` implemented
- [ ] `softDeleteDocument` implemented
- [ ] `listVersions` implemented
- [ ] Input validation on every public service method
- [ ] Business rule: cannot add version when archived/deleted
- [ ] Search filters: query + type + status + pagination
- [ ] `IDocumentService` updated with all method signatures
- [ ] `index.ts` runner demonstrates all flows

### Stage 2
- [ ] `DocumentEntity` status enum updated, `active` column removed, index on `updatedAt`
- [ ] `DocumentVersionEntity` has unique constraint on `(documentId, version)`, explicit FK column
- [ ] `User.ts` entity deleted
- [ ] DB credentials moved to `.env`, dotenv wired
- [ ] `synchronize: false`, migrations configured
- [ ] Initial migration generated and runs cleanly
- [ ] `TypeORMDocumentRepo` implements `IDocumentRepo`
- [ ] Stage 2 runner in `index.ts` works against Postgres
- [ ] Swap test: switching to `InMemoryDocumentRepo` still works
