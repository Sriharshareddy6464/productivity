# Productivity Platform

A hierarchical productivity and collaboration platform with a cascading structure: **Goals → Milestones → Tasks → To-Do Checklists**. Built with Next.js 19, FastAPI, MySQL, and deployed via Docker/Kubernetes on AWS.

## Architecture

```
Frontend (Next.js 19, Tailwind, shadcn/ui)
    ↓ API calls (JWT auth)
Backend (FastAPI, SQLAlchemy async)
    ↓
Database (MySQL 8.0)
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack React Query |
| Animations | Framer Motion, GSAP |
| Backend | FastAPI (async Python), SQLAlchemy, Alembic |
| Auth | Google OAuth 2.0 + JWT |
| Database | MySQL 8.0 |
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |
| IaC | Terraform (AWS) |
| Monitoring | Prometheus + Grafana |

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### Local Development
```bash
# Start all services
docker compose up -d

# With monitoring stack
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | MySQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `JWT_SECRET` | Secret key for JWT signing |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | NextAuth base URL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/auth/google` | Google OAuth login redirect |
| GET | `/auth/google/callback?code=` | OAuth callback, returns JWT |
| POST | `/auth/contacts-permission` | Set contacts sync permission |
| GET | `/auth/me` | Current user info |
| GET | `/goals` | List goals |
| POST | `/goals` | Create goal |
| GET | `/goals/{id}` | Get goal |
| PATCH | `/goals/{id}` | Update goal |
| DELETE | `/goals/{id}` | Delete goal (cascade) |
| GET | `/goals/{id}/milestones` | List milestones |
| POST | `/goals/{id}/milestones` | Create milestone |
| PATCH | `/milestones/{id}` | Update milestone |
| DELETE | `/milestones/{id}` | Delete milestone (cascade) |
| GET | `/milestones/{id}/tasks` | List tasks |
| POST | `/milestones/{id}/tasks` | Create task |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task (cascade) |
| GET | `/tasks/{id}/todos` | List todo items |
| POST | `/tasks/{id}/todos` | Create todo |
| PATCH | `/tasks/{id}/todos/{id}` | Toggle/update todo |
| DELETE | `/tasks/{id}/todos/{id}` | Delete todo |
| POST | `/groups` | Create group |
| GET | `/groups` | List user groups |
| POST | `/groups/{id}/members` | Invite member |
| DELETE | `/groups/{id}/members/{id}` | Remove member |
| GET | `/groups/{id}/members` | List members |
| GET | `/healthz` | Health check |
| GET | `/metrics` | Prometheus metrics |

## Deployment

### Terraform (AWS)
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### Kubernetes
```bash
kubectl create namespace productivity
kubectl apply -f k8s/ -n productivity
```

### CI/CD
- PRs to `develop`/`main` trigger lint, type-check, and tests
- Pushes to `main` build and deploy (configure registry in deploy.yml)
