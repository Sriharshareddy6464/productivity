# Developer Analysis & Run Book

## How to Run Locally

### Prerequisites
- Node.js 20+ (v22.13.1 confirmed)
- Python 3.12+
- Docker & Docker Compose (optional, for MySQL)
- MySQL 8.0 (if not using Docker)

### Quick Start (Docker)
```bash
# 1. Clone & enter project
cd productivity_app

# 2. Create .env from example
cp .env.example .env
# Edit .env with real Google OAuth credentials

# 3. Start everything
docker compose up -d

# Services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Health check: http://localhost:8000/healthz
# - MySQL: localhost:3306

# 4. Run migrations
docker compose exec backend alembic upgrade head

# 5. Monitoring (optional)
docker compose -f docker-compose.monitoring.yml up -d
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

### Manual Setup (No Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Ensure MySQL is running locally
# Create database: CREATE DATABASE productivity;

# Set env vars
$env:DATABASE_URL="mysql+aiomysql://root:rootpassword@localhost:3306/productivity"
$env:GOOGLE_CLIENT_ID="your-client-id"
$env:GOOGLE_CLIENT_SECRET="your-client-secret"
$env:JWT_SECRET="your-jwt-secret"

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install

# Set API URL
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"

npm run dev
# Opens at http://localhost:3000
```

---

## Architecture Overview

```
Frontend (Next.js 16 + React 19) ──HTTP/JWT──> Backend (FastAPI) ──SQL──> MySQL 8.0
     │                                          │
     ├─ Zustand (client state)                  ├─ SQLAlchemy async ORM
     ├─ TanStack Query (server state)           ├─ Alembic migrations
     ├─ Framer Motion + GSAP (animations)       ├─ Prometheus metrics
     └─ shadcn/ui + @base-ui/react (UI)         └─ JWT auth (PyJWT)
```

### Data Model (Cascading)
```
User
 └─ Goal
     └─ Milestone
         └─ Task
             └─ TodoItem
Group
 ├─ GroupMember
 └─ Goal (shared)
```

---

## Critical Issues to Fix

### 1. Auth Middleware Bug (HIGH)
**File:** `frontend/src/middleware.ts`
**Problem:** Middleware reads `request.cookies.get("token")` but the app stores the JWT in `localStorage`. Middleware runs on the server edge where localStorage doesn't exist. Result: **every authenticated user gets redirected to /login**.

**Fix options:**
- **Option A**: Set token in both localStorage AND a cookie after OAuth callback
- **Option B**: Remove middleware protection entirely and rely on the 401 interceptor in `api.ts` + client-side route guards
- **Option C**: Add a `token` cookie with `httpOnly: false` in the callback handler

### 2. Root page.tsx is Dead Code (HIGH)
**File:** `frontend/src/app/page.tsx`
**Problem:** Still contains the default Next.js "Get started" boilerplate. The actual home page is at `frontend/src/app/(app)/page.tsx` which overrides it via route group precedence. Confusing for new developers.

**Fix:** Delete `frontend/src/app/page.tsx` or redirect it to the real app.

### 3. CI Pipeline Failures (HIGH)
**File:** `.github/workflows/ci.yml`
- **Line 22**: `npm run type-check` — this script doesn't exist in `frontend/package.json`. Add it: `"type-check": "tsc --noEmit"`
- **Line 36**: `pytest` — zero test files exist in the repo. Pytest will pass with exit code 5 (no tests collected), but the pipeline is meaningless.

### 4. Backend Dockerfile CMD Mismatch (HIGH)
**File:** `Dockerfile.backend` line 11
**Problem:** CMD is `uvicorn app.main:app` but the source file is at `backend/main.py`, not `backend/app/main.py`. Inside the container, after `COPY backend/ .`, the file is at `/app/main.py`, not `/app/app/main.py`.

**Fix:** Change CMD to `uvicorn main:app --host 0.0.0.0 --port 8000`

### 5. Missing next-auth Dependency (HIGH)
**Files:** `.env.example`, `docker-compose.yml`
**Problem:** References `NEXTAUTH_SECRET` and `NEXTAUTH_URL` but `next-auth` is NOT installed. The app uses its own JWT auth via backend. These env vars are dead config.

**Fix:** Remove them from `.env.example` and `docker-compose.yml`.

---

## Moderate Issues

### 6. Env Var Name Mismatch
**Problem:** `.env.example` uses `DB_URL` but `backend/app/core/config.py` and `docker-compose.yml` use `DATABASE_URL`. Running from `.env.example` directly will result in no DB connection.

### 7. Redundant JWT Libraries
**Problem:** Both `python-jose[cryptography]` and `PyJWT` are in `requirements.txt`. `python-jose` includes full JWT functionality. Remove `PyJWT` (or vice versa — the code uses `python-jose` via `from jose import JWTError, jwt`).

### 8. Empty services/ Directory
**Problem:** `backend/app/services/__init__.py` exists but no service layer is implemented. Business logic lives in API route files. Should either implement services or remove.

### 9. Missing next.config.ts Setup
**Problem:** `frontend/next.config.ts` is empty. For Docker production builds, add `output: "standalone"`. For image domains (Google avatars), add `images.remotePatterns`.

### 10. CORS Too Permissive
**Problem:** `allow_origins=["*"]` in backend. Fine for dev but should be restricted in production.

---

## What to Check When Reviewing

### Backend Checklist
- [ ] Are all endpoints returning proper response models?
- [ ] Are error responses consistent (same shape)?
- [ ] Are foreign key cascades working correctly? (MySQL requires ON DELETE CASCADE at DB level, which Alembic handles)
- [ ] Are async sessions properly closed? (Uses generator-based dependency injection, verify no leaks)
- [ ] Is JWT verification catching expired tokens?
- [ ] Are UUID primary keys indexed?
- [ ] Are there any N+1 query issues in list endpoints?
- [ ] Is the `/metrics` endpoint rate-limited?

### Frontend Checklist
- [ ] Are all components using proper error boundaries?
- [ ] Is the React Query cache invalidation correct? (Currently inconsistent)
- [ ] Are optimistic updates rolled back on error? (Done in TodoColumn.tsx)
- [ ] Is the Zustand store hydrated from localStorage on page load?
- [ ] Are API error states handled gracefully in the UI?
- [ ] Is the responsive layout tested on mobile/tablet/desktop?
- [ ] Does the OAuth callback flow work end-to-end?
- [ ] Are all pages wrapped in ErrorBoundary?
- [ ] Is there a loading state for every data fetch?
- [ ] Are GSAP animations triggering correctly on mount?

### Security Checklist
- [ ] JWT secret: change from hardcoded default in production
- [ ] CORS: restrict to specific origins in production
- [ ] OAuth: verify CSRF protection on Google callback
- [ ] DB credentials: move from hardcoded to secrets in production
- [ ] Rate limiting: not implemented — should add for production

---

## Missing Features / Scope Gaps

1. **No tests** — zero test files anywhere. CI runs pytest but nothing to run.
2. **No user registration flow** — relies entirely on Google OAuth. No email/password auth.
3. **No search** — no endpoint to search across goals/milestones/tasks/todos.
4. **No notifications** — no push/email notification system when assigned to a task.
5. **No real-time collaboration** — no WebSocket/Socket.io for live updates.
6. **No file attachments** — tasks/todos cannot have file uploads.
7. **No activity log** — no audit trail of changes.
8. **No pagination** — list endpoints return all records (will break with scale).
9. **No sorting/filtering** — list endpoints only order by `created_at DESC`.
10. **No keyboard shortcuts** — power users would benefit from `n`, `g`, `t` navigation.
11. **No dark mode** — UI is light-only (shadcn supports dark mode trivially).
12. **No analytics** — no usage tracking or feature adoption metrics.
13. **No data export** — no way for users to export their goals/milestones/tasks.
14. **Frontend API URL** — not exposed via `next.config.ts` env (use `NEXT_PUBLIC_*` prefix already set up).
15. **TypeScript errors** — heavy use of `any` types in frontend components (GoalsColumn, etc).

---

## Environment Variables Reference

| Variable | Required | Default | Used By |
|---|---|---|---|
| `DATABASE_URL` | Yes | `mysql+aiomysql://root:rootpassword@localhost:3306/productivity` | Backend (engine.py) |
| `GOOGLE_CLIENT_ID` | Yes | — | Backend (auth.py) |
| `GOOGLE_CLIENT_SECRET` | Yes | — | Backend (auth.py) |
| `GOOGLE_REDIRECT_URI` | No | `http://localhost:8000/auth/google/callback` | Backend (auth.py) |
| `JWT_SECRET` | Yes | `super-secret-key-change-in-production` | Backend (security.py) |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Frontend (api.ts) |

---

## Database Migrations

```bash
# Generate new migration after model changes
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View history
alembic history
```

Alembic is configured for async MySQL (aiomysql). The initial migration (`001_initial_baseline.py`) creates all 7 tables.

---

## Docker Production Build

```bash
# Build images
docker build -t productivity-frontend -f Dockerfile.frontend .
docker build -t productivity-backend -f Dockerfile.backend .

# Push to registry (example: ECR)
docker tag productivity-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/productivity-frontend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/productivity-frontend:latest

# Deploy to K8s
kubectl apply -f k8s/ -n productivity
```

---

## Project File Map

```
productivity_app/
├── .github/workflows/          # CI/CD pipelines
├── backend/                    # FastAPI application
│   ├── alembic/               # DB migrations
│   └── app/
│       ├── api/               # Route handlers (auth, goals, milestones, tasks, todos, groups)
│       ├── core/              # Config, security, deps
│       ├── db/                # Engine, base, session
│       ├── models/            # SQLAlchemy models (7 tables)
│       ├── schemas/           # Pydantic request/response models
│       └── services/          # Empty — business logic lives in api/ for now
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/               # App Router pages (route groups: (app), (auth))
│       ├── components/        # React components
│       │   ├── ui/           # shadcn primitives (11 components)
│       │   └── workspace/    # 4-column cascading workspace
│       ├── lib/              # API client, utilities
│       └── store/            # Zustand state (auth, workspace, UI)
├── infra/terraform/           # AWS IaC
├── k8s/                       # Kubernetes manifests
└── monitoring/                # Prometheus + Grafana config
```
