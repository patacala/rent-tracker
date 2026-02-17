# Relocation Intelligence 🏙️

> **"See how your life will look before you move."**
>
> Find the best neighborhoods based on your lifestyle — not just property price.

---

## What is this?

Relocation Intelligence is a startup product that helps users discover ideal neighborhoods by scoring them based on:

- 🚗 **Commute time** to their workplace
- 🏪 **Amenity density** (supermarkets, gyms, parks, schools…)
- 👨‍👩‍👧 **Family suitability** bonus
- 📍 **Miami** as the initial launch city

---

## Monorepo Structure

```
rent-tracker/
├── apps/
│   ├── mobile/          React Native + Expo (iOS & Android)
│   └── api/             NestJS + Prisma + PostgreSQL (Supabase)
├── packages/
│   ├── types/           Shared TypeScript types (source of truth)
│   ├── utils/           Shared utility functions
│   └── config/          Shared constants (Miami neighborhoods, score weights)
├── docker/
│   └── api/Dockerfile
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Monorepo     | Turborepo + pnpm workspaces                   |
| Language     | TypeScript (strict, everywhere)               |
| Mobile       | React Native + Expo (SDK 52) + Expo Router v4 |
| Backend      | NestJS + Clean Architecture                   |
| Database     | PostgreSQL via Supabase + Prisma ORM          |
| Code Quality | ESLint + Prettier + strict TS                 |
| Container    | Docker + docker-compose                       |

---

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker (for containerized API)
- Expo Go app on your phone (for mobile dev)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Fill in your DATABASE_URL (Supabase PostgreSQL connection string)
```

### 3. Run Prisma migrations

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Run everything

```bash
# From root — starts both API and mobile
pnpm dev
```

Or run individually:

```bash
# API only
cd apps/api && pnpm dev

# Mobile only
cd apps/mobile && pnpm dev
```

### 5. Or run with Docker

```bash
docker-compose up
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

---

## API Endpoints

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/users`           | Create a new user             |
| POST   | `/preferences`     | Save lifestyle preferences    |
| POST   | `/lifestyle-score` | Calculate neighborhood scores |

Full interactive docs: `http://localhost:3000/api/docs`

---

## Lifestyle Score Formula

```
Overall Score =
  Commute Score × 40%  (inverse distance to work)
+ Amenity Score × 40%  (nearby amenity density)
+ Family Score  × 20%  (schools, parks, safety)
```

All weights are defined in `packages/config/src/index.ts` → `SCORE_WEIGHTS`.

---

## Clean Architecture (Backend)

```
src/
├── domain/              Pure business logic — no framework deps
│   ├── entities/        UserEntity, UserPreferencesEntity, SearchSessionEntity
│   ├── repositories/    Interfaces (IUserRepository, etc.)
│   └── services/        External service interfaces (IPlacesService, IDistanceService)
│
├── application/         Orchestration — Use Cases
│   ├── use-cases/       CreateUser, SaveUserPreferences, CalculateLifestyleScore
│   └── dto/             Validated request/response objects
│
├── infrastructure/      Framework + external concerns
│   ├── prisma/          PrismaService + PrismaModule
│   ├── repositories/    Prisma implementations of domain interfaces
│   └── external/
│       ├── places/      MockPlacesService → replace with GooglePlacesService
│       ├── distance/    MockDistanceService → replace with GoogleDistanceService
│       ├── auth/        (future) Supabase Auth
│       ├── cache/       (future) Redis
│       └── jobs/        (future) BullMQ background jobs
│
└── presentation/        HTTP controllers
    └── controllers/     UsersController, PreferencesController, LifestyleScoreController
```

---

## Feature-Based Mobile Architecture

```
src/
├── features/
│   ├── onboarding/       OnboardingScreen — collect user preferences
│   ├── preferences/      (future) edit preferences
│   └── lifestyle-map/    LifestyleMapScreen — map + scored zones
│
└── shared/
    ├── api/              Typed fetch client
    ├── hooks/            useApi (loading/error state)
    ├── theme/            Design tokens (colors, spacing, typography)
    └── components/       Button, etc.
```

---

## Shared Packages

All types are defined once in `@rent-tracker/types` and used by both backend and frontend:

```typescript
import type { UserPreferences, LifestyleScore, NeighborhoodScore } from '@rent-tracker/types';
```

---

## Future Roadmap (Structure Ready)

| Feature                | Status                                               |
| ---------------------- | ---------------------------------------------------- |
| Google Places API      | Interface ready → swap MockPlacesService             |
| Google Distance Matrix | Interface ready → swap MockDistanceService           |
| Supabase Auth          | Folder prepared at `infrastructure/external/auth`    |
| Redis Caching          | Folder prepared at `infrastructure/external/cache`   |
| Background Jobs        | Folder prepared at `infrastructure/external/jobs`    |
| AI Recommendations     | Architecture supports ML score injection             |
| Realtor Lead Gen       | SearchSession entity tracks all queries              |
| Property Integrations  | NeighborhoodScore ready for property data enrichment |

---

## Scripts Reference

| Command             | Action                      |
| ------------------- | --------------------------- |
| `pnpm dev`          | Start all apps (Turborepo)  |
| `pnpm build`        | Build all packages and apps |
| `pnpm lint`         | Lint all workspaces         |
| `pnpm type-check`   | Type-check all workspaces   |
| `pnpm format`       | Prettier format everything  |
| `docker-compose up` | Start API in Docker         |

---

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection String**
3. Copy the URI and set as `DATABASE_URL` in `apps/api/.env`
4. Run `pnpm prisma:migrate` to create tables

---

_Built with ❤️ for startup scale — from MVP to Series A._
