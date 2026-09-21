# MetaForge Recruiter Application Platform (MRAP)

Architecture-aligned layout. **UI, roles, permissions, and workflows are unchanged.**

## Layout

```
frontend/           React UI (components, features, hooks, services, store, types, utils, public)
backend/            NestJS API (existing; not expanded in this structure pass)
ai-service/         Isolated AI gateway (interfaces/placeholders)
workers/            Reserved for extracted background workers
infrastructure/     Notes for Docker/Caddy/CI locations
documents/          API and BRD references
docker-compose.yml
Caddyfile
.env.example
README.md
MIGRATION_PLAN.md
```

## Local development

```bash
# Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev

# Optional backend  (http://localhost:3001/api/v1) — needs Mongo
cd backend
copy .env.example .env
npm install
npm run start:dev
```

Demo logins (unchanged):

| Role | Email | Password |
|---|---|---|
| Super Admin | r.haines@talentflow.io | Admin@2026 |
| Admin | d.park@talentflow.io | Admin@2026 |
| Team Lead | harish.g@metaforgeit.com | Lead@2026 |
| Recruiter | m.chen@talentflow.io | Rec@2026 |
