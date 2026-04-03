# TaskFlow — Backend API

> **Node.js + TypeScript REST API** with JWT authentication, PostgreSQL, and Prisma ORM.  
> Built as part of the TaskFlow Task Management System (Track A — Full-Stack Engineer).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [Task Endpoints](#task-endpoints)
- [Authentication Flow](#authentication-flow)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 |
| Language | TypeScript |
| Framework | Express.js v5 |
| Database | PostgreSQL |
| ORM | Prisma v5 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs (12 salt rounds) |
| Validation | express-validator |
| Security | helmet, cors |
| Dev Server | nodemon + ts-node |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema — User, Task, RefreshToken
│   ├── seed.ts              # Demo data seeder
│   └── migrations/          # Auto-generated SQL migrations
├── src/
│   ├── index.ts             # Entry point — starts server
│   ├── app.ts               # Express app — middleware + routes
│   ├── controllers/
│   │   ├── auth.controller.ts   # register, login, refresh, logout, getMe
│   │   └── task.controller.ts   # getTasks, getTask, createTask, updateTask, deleteTask, toggleTask, getTaskStats
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT Bearer token verification
│   │   └── validate.middleware.ts # express-validator error handler
│   ├── routes/
│   │   ├── auth.routes.ts       # /auth/* routes
│   │   └── task.routes.ts       # /tasks/* routes (all protected)
│   ├── lib/
│   │   └── prisma.ts            # Prisma client singleton
│   ├── utils/
│   │   ├── jwt.ts               # Token generation + verification helpers
│   │   └── response.ts          # Standardised sendSuccess / sendError helpers
│   └── types/
│       └── index.ts             # TypeScript interfaces (AuthenticatedRequest, JwtPayload, etc.)
├── prisma.config.ts         # Prisma v5 datasource config
├── tsconfig.json
├── nodemon.json
├── package.json
└── .env                     # Not committed — see Environment Variables
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL (via pgAdmin or any PostgreSQL installation)
- npm

### 1. Clone and install

```bash
cd backend
npm install
```

### 2. Set up environment variables

Create a `.env` file in the `backend/` root (see [Environment Variables](#environment-variables)).

### 3. Create the database

In pgAdmin, right-click **Databases → Create** and name it `taskflow_db`.

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed demo data

```bash
npx ts-node --transpile-only prisma/seed.ts
```

This creates:
- **Demo user:** `demo@taskflow.dev` / `Demo@1234`
- **10 sample tasks** with mixed statuses and priorities

### 6. Start the dev server

```bash
npm run dev
```

Server runs at **http://localhost:5000**

Verify with:
```bash
curl http://localhost:5000/health
# → { "status": "ok", "timestamp": "..." }
```

---

## Environment Variables

Create `backend/.env` with the following:

```env
# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow_db"

# ── Server ────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=your_access_secret_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters_long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## Database Setup

### Schema Overview

```
users
  id          CUID (PK)
  email       UNIQUE
  password    bcrypt hash
  name
  createdAt
  updatedAt

tasks
  id          CUID (PK)
  title
  description (optional)
  status      PENDING | IN_PROGRESS | COMPLETED  (default: PENDING)
  priority    LOW | MEDIUM | HIGH                (default: MEDIUM)
  dueDate     (optional)
  userId      FK → users.id  (CASCADE DELETE)
  createdAt
  updatedAt

refresh_tokens
  id          CUID (PK)
  token       UNIQUE
  userId      FK → users.id  (CASCADE DELETE)
  expiresAt
  createdAt
```

### Indexes

- `tasks(userId)` — all task queries filter by userId
- `tasks(userId, status)` — filtered queries by status
- `refresh_tokens(userId)` — token lookups by user

### Cascade Deletes

Deleting a user automatically removes all their tasks and refresh tokens — no orphaned rows.

---

## API Reference

All responses follow this structure:

```json
{
  "success": true,
  "message": "Description",
  "data": { },
  "error": "optional error code",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### Auth Endpoints

#### `POST /auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Password rules:** min 8 characters, must include uppercase, lowercase, and a number.

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "email": "jane@example.com", "name": "Jane Smith", "createdAt": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Error responses:** `400` validation failed · `409` email already registered

---

#### `POST /auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Error responses:** `400` validation failed · `401` invalid credentials

---

#### `POST /auth/refresh`

Exchange a valid refresh token for a new access token + refresh token pair (rotation).

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Error responses:** `400` token missing · `401` invalid or expired token

---

#### `POST /auth/logout`

🔒 **Protected** — requires `Authorization: Bearer <accessToken>`

Invalidates the refresh token server-side.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

#### `GET /auth/me`

🔒 **Protected** — returns the currently authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "...",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### Task Endpoints

> All task endpoints require `Authorization: Bearer <accessToken>` header.  
> Tasks are **user-scoped** — users can only access their own tasks.

---

#### `GET /tasks`

Get paginated, filterable task list.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 50) |
| `status` | string | — | `PENDING` · `IN_PROGRESS` · `COMPLETED` |
| `priority` | string | — | `LOW` · `MEDIUM` · `HIGH` |
| `search` | string | — | Searches title and description (case-insensitive) |
| `sortBy` | string | `createdAt` | `createdAt` · `updatedAt` · `title` · `dueDate` · `priority` |
| `sortOrder` | string | `desc` | `asc` · `desc` |

**Example:**
```
GET /tasks?status=PENDING&priority=HIGH&search=api&page=1&limit=10
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [ { "id": "...", "title": "...", "status": "PENDING", "priority": "HIGH", ... } ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

#### `POST /tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions for deployment.",
  "priority": "HIGH",
  "dueDate": "2026-04-15"
}
```

`title` is required. All other fields are optional. `status` defaults to `PENDING`.

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { "id": "...", "title": "Set up CI/CD pipeline", "status": "PENDING", ... }
}
```

---

#### `GET /tasks/stats`

Get task count statistics for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "message": "Stats fetched successfully",
  "data": {
    "total": 10,
    "pending": 4,
    "inProgress": 2,
    "completed": 4
  }
}
```

---

#### `GET /tasks/:id`

Get a single task by ID.

**Response `200`:** Full task object.  
**Error:** `404` if not found or belongs to another user.

---

#### `PATCH /tasks/:id`

Update one or more fields of a task. All fields are optional.

**Request Body (any combination):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "LOW",
  "dueDate": "2026-05-01"
}
```

**Response `200`:** Updated task object.

---

#### `DELETE /tasks/:id`

Delete a task permanently.

**Response `200`:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

---

#### `PATCH /tasks/:id/toggle`

Cycle the task status in order: `PENDING → IN_PROGRESS → COMPLETED → PENDING`

**Response `200`:** Updated task object with new status.

---

## Authentication Flow

```
1. User registers or logs in
   └─ Server returns: accessToken (15 min) + refreshToken (7 days)

2. Client stores both tokens in localStorage

3. Every API request sends:
   └─ Authorization: Bearer <accessToken>

4. When accessToken expires (401 + TOKEN_EXPIRED):
   └─ Client sends refreshToken to POST /auth/refresh
   └─ Server: deletes old refreshToken, issues new pair (rotation)
   └─ Client: stores new tokens, retries original request

5. On logout:
   └─ Server deletes refreshToken from database
   └─ Client removes both tokens from localStorage
```

---

## Error Handling

| HTTP Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Validation failed / bad request |
| `401` | Unauthenticated — missing, invalid, or expired token |
| `404` | Resource not found |
| `409` | Conflict — e.g., email already registered |
| `500` | Internal server error |

All errors follow the standard response envelope:
```json
{
  "success": false,
  "message": "Human-readable message",
  "error": "MACHINE_CODE or details"
}
```

Special error codes on `401`:
- `TOKEN_EXPIRED` — access token expired, client should refresh
- `INVALID_TOKEN` — token is malformed or tampered

---

## Scripts

```bash
npm run dev          # Start development server with hot reload (nodemon + ts-node)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Apply pending migrations
npm run db:seed      # Seed demo user and tasks
npm run db:studio    # Open Prisma Studio (visual DB browser) at localhost:5555
```

---

## Demo Credentials

After running the seeder:

```
Email:    demo@taskflow.dev
Password: Demo@1234
```
