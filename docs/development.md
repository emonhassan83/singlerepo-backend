# Development Guide

This guide describes the official development workflow for the repository.

> [!WARNING]
> **This repository is strictly Docker-centric.**
> Do not run Redis or the backend services locally on your machine.
> Use Docker Compose for all development, testing, and runtime validation.

## 1. Required Tools

- Docker Desktop or Docker Engine + Compose
- Node.js (for script execution and code editing)
- pnpm

## 2. Environment Setup

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Ensure `MONGODB_URI` inside `server/.env` is set to your MongoDB Atlas (Cloud) connection string.

## 3. Start the Project

Run the full stack from the repository root:

```bash
docker compose up --build
```

Docker Compose will:

- build the server service image
- start Redis
- attach live source folders into the container
- preserve container-installed dependencies with anonymous volumes

To stop the stack:

```bash
docker compose down
```

## 4. Useful Docker Commands

```bash
docker compose ps
docker compose logs -f server
docker compose restart server
docker compose exec server sh
```

## 5. Script Reference

### Server scripts

```bash
pnpm run build
pnpm run start
pnpm run dev
pnpm run format
pnpm run lint
pnpm run create:module
pnpm run create:admin
pnpm run create:subscriptionFeature
```

## 6. Developer Workflow

1. Make code changes in the server folder.
2. Use Docker Compose to rebuild/restart the affected service when needed.
3. Verify logs with `docker compose logs -f server`.
4. Keep root-level environment files out of the repository.

## 7. Recommended Practices

- Prefer Docker Compose for all validation and integration checks.
- Do not rely on host-installed Redis for local development.
- Keep documentation updated whenever scripts, services, or workflows change.
- Use `server/.env.example` file as a template for new contributors.
