# Single-Repo Backend

> [!WARNING]
> **This project is strictly Docker-centric.**
> Do not try to run the backend services or Redis directly on your host machine.
> The supported development flow is to use Docker Compose for everything.

## 1. Purpose

This repository contains the single-repo backend system:

- `server`: Express API, Socket.IO, Auth, BullMQ Workers (background tasks), Node-Cron Scheduler (cron jobs), and database endpoints.
- `redis`: Running in Docker as the caching and queue backend for BullMQ.
- `MongoDB`: Hosted on MongoDB Atlas (Cloud Database), managed via the `MONGODB_URI` environment variable.

## 2. Prerequisites

Required for local setup:

- Docker Desktop or Docker Engine with Docker Compose
- Node.js (LTS recommended)
- pnpm

## 3. Repository Layout

```text
.
├── docker-compose.yaml      # Docker Compose config for redis and server
├── server/                  # Backend application source code
│   ├── src/
│   │   ├── app/
│   │   │   ├── worker/      # BullMQ background workers (email, notifications, etc.)
│   │   │   ├── jobs/        # Cron job schedules using node-cron
│   │   │   └── ...
│   └── ...
├── docs/                    # Architecture and API documentation
└── README.md                # Root setup guide
```

## 4. Documentation Map

Use this map to navigate the repository:

| Area                 | Purpose                            | Location                                   |
| -------------------- | ---------------------------------- | ------------------------------------------ |
| Root setup guide     | Full project onboarding            | [README.md](README.md)                     |
| Developer docs index | Documentation navigation           | [docs/README.md](docs/README.md)           |
| Development workflow | Docker-first workflow and scripts  | [docs/development.md](docs/development.md) |
| Architecture details | System architecture & data flows   | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)|
| API guidelines       | Response and error formatting      | [docs/API_GUIDELINES.md](docs/API_GUIDELINES.md) |

## 5. Clone and Bootstrap

```bash
git clone <your-repo-url>
cd singlerepo-backend
```

Create service environment file:

```bash
cp server/.env.example server/.env
```

Ensure `MONGODB_URI` inside `server/.env` is set to your MongoDB Atlas (Cloud) database URL.

## 6. Run the Entire Project with Docker

From the repository root:

```bash
docker compose up --build
```

This command will:

- build the `server` container
- start the `redis` service
- mount local source folders into the container for live development
- keep dependencies inside container volumes

Useful commands:

```bash
docker compose down
docker compose ps
docker compose logs -f server
```

## 7. Health Check

The API endpoint for health verification is:

```http
GET /health
```

Expected response:

- HTTP `200`
- JSON payload containing `success: true`

## 8. Troubleshooting

### Docker build or startup issues

```bash
docker compose down
docker compose up --build
```

### Environment values are missing

Make sure the server-level `.env` file exists and is correctly populated:

- `server/.env`
