# TaskFlow — Frontend

> **Next.js 14 + TypeScript** web application for the TaskFlow Task Management System.  
> Built as part of the Full-Stack Engineer assessment (Track A).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [State Management](#state-management)
- [Authentication Architecture](#authentication-architecture)
- [API Integration](#api-integration)
- [Design System](#design-system)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| State Management | Zustand |
| HTTP Client | Native Fetch API |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Date Utilities | date-fns |
| Fonts | Syne (display) + Outfit (body) via Google Fonts |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout — fonts, toast provider
│   │   ├── globals.css             # Design system CSS variables + utilities
│   │   ├── page.tsx                # Root redirect — /dashboard or /auth/login
│   │   ├── auth/
│   │   │   ├── layout.tsx          # Split-panel auth layout with animated grid
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login form with validation
│   │   │   └── register/
│   │   │       └── page.tsx        # Register form with password strength checker
│   │   └── dashboard/
│   │       └── page.tsx            # Main dashboard — stats, filters, task list
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx          # Sticky glassmorphism top navigation
│   │   └── tasks/
│   │       ├── StatsBar.tsx        # Animated stat counters (total/pending/progress/done)
│   │       ├── TaskFilters.tsx     # Search bar + status/priority/sort dropdowns
│   │       ├── TaskList.tsx        # Paginated task list with skeleton loading
│   │       ├── TaskCard.tsx        # Individual task row with hover actions
│   │       └── TaskModal.tsx       # Create / Edit task bottom sheet modal
│   ├── lib/
│   │   └── api.ts                  # API client — fetch wrapper + token refresh logic
│   ├── store/
│   │   ├── authStore.ts            # Zustand — user auth state + login/register/logout
│   │   └── taskStore.ts            # Zustand — tasks, filters, pagination, CRUD actions
│   └── types/
│       └── index.ts                # TypeScript interfaces — Task, User, ApiResponse, etc.
├── .env.local                      # Local environment variables (not committed)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- The **backend API running** on `http://localhost:5000`

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set up environment variables

Create `.env.local` in the `frontend/` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start the development server

```bash
npm run dev
```

App runs at **http://localhost:3000**

> Make sure the backend is running first. The frontend will not function without the API.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## Features

### Authentication
- **Register** with name, email, and password — live password strength checker
- **Login** with email and password — clear validation errors
- **Auto-redirect** — authenticated users land on `/dashboard`, guests on `/auth/login`
- **Silent token refresh** — expired access tokens are renewed automatically in the background
- **Logout** — invalidates refresh token server-side and clears localStorage

### Dashboard
- **Personalised greeting** — changes based on time of day (morning/afternoon/evening)
- **Motivational context line** — updates based on task completion ratio
- **Animated stat counters** — Total, Pending, In Progress, Completed — counts up on load

### Task Management
- **Create tasks** — title (required), description, priority, due date
- **Edit tasks** — all fields including status, in a bottom-sheet modal
- **Delete tasks** — with confirmation prompt
- **Toggle status** — cycles `PENDING → IN_PROGRESS → COMPLETED → PENDING` in one click

### Filtering & Search
- **Live search** — debounced 380ms, searches title and description
- **Status filter** — All / Pending / In Progress / Completed
- **Priority filter** — All / High / Medium / Low
- **Sort order** — Newest first / Oldest first
- **Active filter pills** — visual indicators with individual remove buttons
- **Reset all** — clears every filter at once

### UX Details
- **Pagination** — 10 tasks per page, page buttons with active state
- **Skeleton loading** — placeholder cards animate while data loads
- **Overdue highlighting** — due dates shown in red when past
- **Due today badge** — amber colour when task is due today
- **Due soon** — shows "Due in Nd" for tasks due within 3 days
- **Priority colour stripes** — red (high), amber (medium), green (low)
- **Toast notifications** — success and error feedback on every action
- **Responsive design** — mobile, tablet, and desktop layouts
- **Keyboard support** — Escape closes modals, focus management on open

---

## Pages & Routes

| Route | Page | Protection |
|---|---|---|
| `/` | Root redirect | None — redirects based on token |
| `/auth/login` | Login | Guest only |
| `/auth/register` | Register | Guest only |
| `/dashboard` | Main app | Authenticated |

---

## State Management

Two Zustand stores manage all application state:

### `authStore`

```ts
{
  user: User | null          // Currently authenticated user
  isAuthenticated: boolean   // Auth status flag
  isLoading: boolean         // Login/register loading state

  login(email, password)     // POST /auth/login → stores tokens
  register(name, email, pw)  // POST /auth/register → stores tokens
  logout()                   // POST /auth/logout → clears tokens
  fetchMe()                  // GET /auth/me → restores session on page load
}
```

### `taskStore`

```ts
{
  tasks: Task[]              // Current page of tasks
  stats: TaskStats | null    // Aggregated counts
  filters: TaskFilters       // Active filter state
  pagination: Pagination     // Page, limit, total, totalPages
  isLoading: boolean         // Fetch in progress
  isSubmitting: boolean      // Create/update/delete in progress

  fetchTasks()               // GET /tasks with current filters
  fetchStats()               // GET /tasks/stats
  createTask(data)           // POST /tasks
  updateTask(id, data)       // PATCH /tasks/:id
  deleteTask(id)             // DELETE /tasks/:id
  toggleTask(id)             // PATCH /tasks/:id/toggle
  setFilters(partial)        // Update filters + reset to page 1
  resetFilters()             // Restore default filters
}
```

---

## Authentication Architecture

### Token Storage
Both access and refresh tokens are stored in `localStorage` under the keys `accessToken` and `refreshToken`.

### Session Restoration
On every page load, `fetchMe()` is called — it reads the stored access token and hits `GET /auth/me`. If valid, the user state is restored. If expired, the refresh flow begins automatically.

### Automatic Token Refresh Flow

```
Request fails with 401 + TOKEN_EXPIRED
        │
        ▼
Is a refresh already in progress?
   YES → Queue this request, wait for token
   NO  → Begin refresh
        │
        ▼
POST /auth/refresh with stored refreshToken
        │
        ├── Success → Store new access + refresh tokens
        │             → Process queued requests with new token
        │             → Retry original request
        │
        └── Failure → Clear localStorage
                    → Redirect to /auth/login
```

This means if 5 requests fire simultaneously and all get `TOKEN_EXPIRED`, only **one** refresh call is made — the rest wait in a queue and all succeed when the token is ready.

### Refresh Token Rotation
Every time a refresh token is used, the server deletes the old one and issues a new one. Each refresh token is single-use. This prevents replay attacks.

---

## API Integration

All API calls go through `src/lib/api.ts` which provides:

- **`apiRequest<T>(endpoint, options)`** — base fetch wrapper with auth headers and 401 handling
- **`authApi`** — register, login, logout, getMe, refresh
- **`tasksApi`** — getAll, create, update, delete, toggle, getStats

### Standard Response Shape

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;        // Machine-readable error code e.g. TOKEN_EXPIRED
  meta?: {               // Only on paginated responses
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Design System

The UI uses a **dark editorial aesthetic** — deep void blacks with electric indigo accents.

### Colour Palette (CSS Variables)

```css
--void: #090b11           /* Page background */
--surface: #0f1117        /* Input backgrounds */
--panel: #151821          /* Cards and containers */
--border: #1e2230         /* Default borders */
--border-light: #252840   /* Lighter borders */
--muted: #4a5068          /* Disabled / placeholder text */
--subtle: #6b7280         /* Secondary text */
--body: #9ba3b8           /* Body text */
--heading: #e8eaf0        /* Headings and important text */
--indigo: #6366f1         /* Primary accent */
--indigo-glow: rgba(99,102,241,0.2)
```

### Typography

- **Display font:** `Syne` — used for headings, the logo, stats numbers
- **Body font:** `Outfit` — used for all body text, labels, inputs

### Key Components

| Component | Description |
|---|---|
| `.btn-primary` | Gradient indigo button with shimmer hover |
| `.field` | Dark input field with indigo focus ring |
| `.glass` | Glassmorphism card with backdrop blur |
| `.task-card` | Lifts 2px on hover with indigo glow border |
| `.skeleton` | Shimmer loading placeholder |

### Animations

| Class | Effect |
|---|---|
| `animate-fade-up` | Fade in from 20px below |
| `animate-fade-in` | Simple opacity fade |
| `animate-scale-in` | Scale from 0.95 to 1 |
| `animate-pulse-glow` | Breathing opacity pulse |
| `animate-shimmer` | Skeleton loading sweep |

---

## Scripts

```bash
npm run dev      # Start Next.js development server at localhost:3000
npm run build    # Build optimised production bundle
npm run start    # Serve production build
npm run lint     # Run ESLint
```

---

## Demo Credentials

```
Email:    demo@taskflow.dev
Password: Demo@1234
```

These are created by the backend seeder and come with 10 pre-populated tasks.
