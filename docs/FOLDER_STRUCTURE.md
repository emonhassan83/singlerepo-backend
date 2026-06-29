# Workspace Layout & Folder Structure

This document outlines the organization of codebases, schemas, queues, and configuration files across the single-repo.

---

## 1. Repository Layout

```text
.
├── docker-compose.yaml      # Multi-container orchestration config (Redis and Server)
├── server/                  # Express API Server directory
│   ├── src/
│   │   ├── app.ts           # App initialization and middleware configuration
│   │   ├── server.ts        # Server startup, worker boot, and cron initialization
│   │   └── app/
│   │       ├── @types/      # TS Declaration and system namespaces
│   │       ├── configs/     # System services configurations (CORS, Redis, Mongoose)
│   │       ├── constant/    # Shared server constants
│   │       ├── core/        # Deep core mechanisms
│   │       ├── errors/      # Custom Error classes and mapping helpers
│   │       ├── jobs/        # Integrated Cron Scheduler using node-cron
│   │       ├── middlewares/ # Express routing middlewares (Auth, Tracing)
│   │       ├── modules/     # Domain Modules (Auth, Users, Notifications)
│   │       ├── queues/      # BullMQ queue instantiations
│   │       ├── redis/       # Redis client caching helpers
│   │       ├── routes/      # Versioned Express router indexes
│   │       ├── schemas/     # Mongoose model schema definitions
│   │       ├── socket/      # Socket.IO handlers
│   │       ├── utils/       # General helper methods
│   │       └── worker/      # BullMQ Background Task Workers
├── docs/                    # Central developer documentation system
└── README.md                # Main onboarding documentation
```

---

## 2. Server Application Structure

The API application lives inside [server/src](file:///c:/bdcalling/explore/singlerepo-backend/server/src):

- `server.ts` is the main entry point. It boots up connection to Redis and Database, starts background workers and cron schedules, and starts listening on the defined port.
- `app.ts` initializes middlewears, global error handlers, socket.io, and route bindings.

---

## 3. Module Directory Structure

Features are isolated inside domain folders inside `server/src/app/modules/<module>`:

```text
auth/
├── auth.controllers.ts     # Express controller actions
├── auth.services.ts        # Business logic and database access
├── auth.routes.ts          # Express router configuration
├── auth.validators.ts      # Input validator schemas (Zod)
├── auth.interface.ts       # Module interfaces
└── auth.helpers.ts         # Module helpers
```
Each file name follows the format `<module-name>.<type>.ts` for clear separation of concerns.
