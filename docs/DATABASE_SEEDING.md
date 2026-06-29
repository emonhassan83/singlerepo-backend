# Database Models & Seeding Workflows

This document describes how MongoDB Mongoose models are managed in the monorepo and details the database seeding pipelines.

---

## 1. Mongoose Model Architecture

To enforce absolute schema consistency across all monorepo packages, models and schemas are declared inside the shared package:
- **Location**: [schemas/modules/](file:///c:/bdcalling/explore/monorepo-backend/schemas/modules)
- **Deployment**: Running `pnpm run sync:schema` copies the compiled types and models into target applications:
  - `server/src/app/schemas/`
  - `worker/src/app/schemas/`
  - `corn/src/app/schemas/`

> [!WARNING]
> Do not edit generated schemas inside the server or worker directories directly. They are git-ignored and will be overwritten during the next schema synchronization.

---

## 2. Seed Scripts

The server service provides utility scripts to populate or initialize the database under [server/scripts](file:///c:/bdcalling/explore/monorepo-backend/server/scripts). These must be executed via the Docker service context.

### A. Seed Platform Settings
Inserts initial application metadata (Support Contact, Support Email, Terms, and Privacy Policies).
- **Execution (Root)**:
  ```bash
  docker compose exec server pnpm run seed:settings
  ```
- **File Reference**: [server/scripts/seedSettings.js](file:///c:/bdcalling/explore/monorepo-backend/server/scripts/seedSettings.js)

### B. Create Admin User
Creates an administrative system account.
- **Execution (Root)**:
  ```bash
  docker compose exec server pnpm run create:admin
  ```
- **File Reference**: `server/scripts/createAdmin.js`

---

## 3. Seeding Best Practices

All seeding scripts must enforce **Idempotency** (can be executed multiple times without generating duplicate documents or corrupted states):
1. **Avoid `insertMany`**: Do not use blind insertion commands that lack unique checks.
2. **Use Upsert (`updateOne` with `upsert: true`)**: Utilize filter criteria matching a unique key.
3. **Use `$setOnInsert`**: When you want to initialize default settings (e.g. support contact email) but do not want to overwrite custom modifications already made in the database.

**Example Implementation Pattern (from [seedSettings.js](file:///c:/bdcalling/explore/monorepo-backend/server/scripts/seedSettings.js)):**
```javascript
const bulkOps = settingsData.map((setting) => ({
  updateOne: {
    filter: { key: setting.key },
    update: { $setOnInsert: setting },
    upsert: true,
  },
}));

const result = await Setting.bulkWrite(bulkOps);
```
