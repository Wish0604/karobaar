# PAYTM LOCALAI

Voice-first hyperlocal commerce + merchant growth AI MVP.

## Monorepo Structure

- `apps/backend` - Node.js/Express API (auth, onboarding, products, discovery, reservations, orders, payments, assistant proxy).
- `apps/ai-service` - FastAPI intelligence service (assistant response + growth recommendations).
- `apps/web` - React + Vite role-based demo frontend.
- `packages/shared` - shared contracts for tool policies and statuses.
- `infra/db` - PostgreSQL schema and seed files.
- `docs` - architecture, API map, MVP scope, and roadmap.

## Quick Start

### 1) Install JS dependencies

```bash
npm install
```

### 2) Install AI service Python dependencies

```bash
pip install -r apps/ai-service/requirements.txt
```

### 3) Copy environment file

```bash
copy .env.example .env
```

### 4) Start infra

```bash
docker compose up -d
```

### 5) Run services

```bash
npm run dev
```

- Backend: `http://localhost:4000`
- AI service: `http://localhost:8000`
- Web app: `http://localhost:5173`

## Core API Endpoints (MVP)

### Authentication
- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`

### Merchant
- `POST /api/v1/merchant/onboarding`
- `GET /api/v1/merchant/onboarding/status`
- `POST /api/v1/merchant/products`
- `GET /api/v1/merchant/products`
- `PATCH /api/v1/merchant/inventory/:productId`

### Discovery
- `GET /api/v1/discovery/search`
- `GET /api/v1/discovery/compare`

### Reservation and Orders
- `POST /api/v1/reservations`
- `POST /api/v1/reservations/:id/confirm`
- `POST /api/v1/orders`

### Payment
- `POST /api/v1/payments/create`
- `POST /api/v1/payments/webhook`

### AI
- `POST /api/v1/ai/assistant/message`
- `POST /v1/assistant/message` (direct AI service)
- `POST /v1/recommendations/growth` (direct AI service)

## Hackathon Demo Story (Ready)
1. Merchant onboarding call.
2. Add products.
3. Customer search and compare.
4. Create reservation and confirm.
5. Create order and payment.
6. Ask AI for growth recommendation.

## Important Notes
- Payment and verification flows are scaffolded as demo-safe placeholders.
- LLM is used for interpretation only; core numbers and state are backend-driven.
- Inventory model supports physical, reserved, and available stock logic.
# karobaar
