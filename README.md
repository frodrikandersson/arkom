# Arkom

Art showcase platform supporting 2D, 3D, and standard image files.

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Neon DATABASE_URL to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: Neon (Postgres) + Drizzle ORM
- 3D Rendering: Three.js + React Three Fiber

## Database
Run migrations:
```bash
cd backend
npm run db:generate
npm run db:push
```