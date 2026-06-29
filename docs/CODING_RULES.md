# TypeScript Coding Style & Linting Standards

This document defines TypeScript development standards, path configurations, file-naming conventions, and patterns for the repository.

---

## 1. Development Principles

1. **Strict Type Safety**:
   - Explicitly define argument and return types for all functions, controllers, and helper methods.
   - Avoid using the `any` type. Where variable type is variable or unknown, use `unknown`.
2. **Layer Separation**:
   - Do not query the database, invoke queues, or make HTTP requests directly inside controllers.
   - Do not write presentation code or manipulate Express request/response parameters inside services.
3. **Decoupled Configuration**:
   - Read env configurations from validated configuration objects (e.g., [server/src/app/configs/env.configs.ts](file:///c:/bdcalling/explore/monorepo-backend/server/src/app/configs/env.configs.ts)). Do not use `process.env` directly in application logic.

---

## 2. Naming Conventions

Consistency is key to codebase maintainability.

| File Type / Concept | Pattern | Example |
| :--- | :--- | :--- |
| **Directory Names** | `kebab-case` | `user-profile/` |
| **Modules** | Singular `kebab-case` | `settings/` |
| **Controllers** | `<name>.controllers.ts` | `auth.controllers.ts` |
| **Services** | `<name>.services.ts` | `auth.services.ts` |
| **Routes** | `<name>.routes.ts` | `auth.routes.ts` |
| **Validators** | `<name>.validators.ts` | `auth.validators.ts` |
| **Interfaces** | `<name>.interface.ts` | `auth.interface.ts` |
| **Class Names** | `PascalCase` | `class ApiError extends Error` |
| **Variables / Functions** | `camelCase` | `const getTraceId = () => ...` |

---

## 3. Path Aliases

To avoid deeply-nested relative paths (`../../../../utils`), configure and use path aliases:
- `@/*` points to `src/*`
- Example import: `import { env } from '@/app/configs/env.configs';`

---

## 4. Linting & Formatting Command Reference

Always format and lint your changes before committing.

### Code Formatting
To format the codebase using Prettier:
```bash
pnpm run format
```

### Static Analysis & Linting
To perform static analysis using ESLint:
```bash
pnpm run lint
```
Any linting errors will block production Docker builds, so they must be resolved during local development.
