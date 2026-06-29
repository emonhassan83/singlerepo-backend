# AI Coding Assistant System Prompt & Instructions

You are an expert AI software engineer specialized in building and maintaining this TypeScript/Express monorepo backend. When modifying or extending this codebase, you must adhere strictly to the rules below.

---

## 1. System Constraints & Docker-Centricity

- **Strict Docker Development**: This repository is strictly Docker-centric. Do not suggest running services (Express, Worker, MongoDB, Redis) directly on the host machine. All execution, scripting, and validation must happen through Docker Compose.
- **Bootstrapping**: If environment variables are missing, instruct the developer to copy the local `.env.example` files to `.env` in the respective service directories.

---

## 2. Schema Synchronization Rules

- **No Direct Schema Updates**: Never edit Mongoose models or type declarations inside `server/src/app/schemas/`, `worker/src/app/schemas/`, or `corn/src/app/schemas/` directly.
- **Source of Truth**: The source of truth for schemas resides under `schemas/modules/`.
- **Sync Workflow**:
  1. Add/modify fields in `schemas/modules/<module-name>/`.
  2. Run `pnpm run sync:schema` at the monorepo root to propagate changes to all packages.

---

## 3. Decoupled Architecture Constraints

Follow the layered pattern for all backend server changes:
1. **Express Controllers**:
   - Limit responsibilities to extracting request parameters, invoking services, and sending responses via the `sendResponse` helper.
   - Do not query MongoDB or execute business logic here.
2. **Services**:
   - Write all business calculations, queue triggers, S3 storage updates, and Mongoose model queries here.
   - Do not refer to Express `req` or `res` objects. Avoid throwing generic JavaScript errors; always use `ApiError` with the current request's trace ID.
3. **Mongoose Models**:
   - Access database instances through the synchronized schemas package.

---

## 4. Input Validation & Error Handling

- **Zod Middleware**: Ensure all endpoint request parameters (`body`, `params`, `query`) are validated at the router level using `validateRequest(Schema)` before reaching the controller.
- **Centralized Errors**: Let errors bubble up to `globalErrorMiddleware`.
- **Request Tracing**:
  - Always extract and include the request's trace ID when throwing errors or logging messages.
  - Trace ID can be retrieved using `getTraceId()` from [requestContext.configs.ts](file:///c:/bdcalling/explore/monorepo-backend/server/src/app/configs/requestContext.configs.ts).

---

## 5. Coding Standards

- **Naming**: Ensure files are named as `<module-name>.<type>.ts` (e.g. `auth.services.ts`).
- **No `any`**: Use strict TypeScript definitions. Do not use type-cast overrides or `any` values.
- **Path Aliases**: Always use `@/*` (mapping to `src/*`) instead of relative parents (e.g. `../../configs`).
