# SkyGeni – Revenue Intelligence Console

A single-page Revenue Intelligence Console that helps a CRO answer:

- **Why are we behind (or ahead) on revenue this quarter?**
- **What should we focus on right now?**

## Repo structure

```
/
├── backend/     # TypeScript API (Express)
├── frontend/    # React + TypeScript (Vite, Material UI, D3)
├── data/        # JSON data (accounts, reps, deals, activities, targets)
├── THINKING.md  # Assumptions, data issues, tradeoffs, scale, AI use
└── README.md
```

## API endpoints

All responses are JSON.

| Endpoint | Description |
|----------|-------------|
| `GET /api/summary` | Current quarter revenue, target, gap (%), YoY or QoQ change; includes 6‑month trend for the chart |
| `GET /api/drivers` | Pipeline size, win rate, average deal size, sales cycle time (with change indicators) |
| `GET /api/risk-factors` | Stale deals, underperforming reps, low-activity accounts |
| `GET /api/recommendations` | 3–5 actionable suggestions (e.g. focus on aging deals, coach reps, increase activity) |

## Run locally

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

Server runs at **http://localhost:3001**. For development with auto-reload:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** and proxies `/api` to the backend. Ensure the backend is running on port 3001.

### One-shot (from repo root)

```bash
cd backend && npm install && npm run build && npm start &
cd frontend && npm install && npm run dev
```

## Tech stack

- **Backend**: Node.js, Express, TypeScript. Data loaded from JSON in `data/` (in-memory; no database).
- **Frontend**: React 18, TypeScript, Vite, Material UI, D3 (charting only).

## Reflection

See **THINKING.md** for assumptions, data issues, tradeoffs, what would break at 10× scale, and how AI was used vs human decisions.
# Skygeni-CRO-
