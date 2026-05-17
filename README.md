# Productivity Platform

A hierarchical productivity and collaboration platform with a cascading structure: **Goals → Milestones → Tasks → To-Do Checklists**. Built with Next.js, FastAPI, MySQL, and deployed via Docker/Kubernetes on AWS.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### Local Development
```bash
docker compose up -d
```

### Environment Variables
Copy `.env.example` and configure:
- `DB_URL` — MySQL connection string
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `JWT_SECRET` — Secret key for JWT signing
- `NEXTAUTH_SECRET` — NextAuth secret
- `NEXTAUTH_URL` — NextAuth base URL
