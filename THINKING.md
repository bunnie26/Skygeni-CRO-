# Reflection: Revenue Intelligence Console

## What assumptions did you make?

- **Current quarter**: The app assumes “current” quarter is Q1 2026 (Jan–Mar) and uses a fixed reference date of 2026-02-03 so results are deterministic for the provided dataset.
- **Targets**: `targets.json` only has 2025 monthly targets. For Q1 2026, the quarter target is the sum of 2025 Q1 months (Jan–Mar 2025) as a proxy. For the 6‑month trend, targets use 2025 months where available and fall back to the previous year’s same month when not.
- **Revenue**: “Current quarter revenue” is the sum of **Closed Won** deal amounts where `closed_at` falls in that quarter. Deals with `amount: null` are treated as 0.
- **Stale deals**: Deals in Prospecting or Negotiation with no `closed_at` and with `created_at` more than 30 days before the reference date are considered stale. Stale counts are broken down by account segment (from `accounts.json`) when available.
- **Underperforming reps**: Reps with at least 5 closed deals (Won + Lost) and win rate &lt; 15% are flagged. Win rate = Closed Won / (Closed Won + Closed Lost).
- **Low-activity accounts**: Accounts that have at least one deal but no activity in `activities.json` in the last 30 days (relative to the reference date) are counted as low activity.
- **Drivers “change” metrics**: Pipeline value, win rate, avg deal size, and sales cycle are computed from the full dataset. The “change” values (e.g. +12%, -4%) are currently illustrative placeholders; a full implementation would compare to a prior period (e.g. previous quarter or same quarter last year).
- **Data path**: Backend expects to run from the repo with data in `/data` (i.e. `backend/dist` or `backend/src` is two levels above repo root, so `../../data` points to the `data/` folder).

## What data issues did you find?

- **Null amounts**: Many deals have `amount: null`. They are excluded from revenue and from “won with amount” for average deal size; revenue and averages may understate true values.
- **Closed dates**: Some deals have `closed_at` in the future (e.g. 2026-03-05) or inconsistent with `stage` (e.g. Closed Won/Lost with null `closed_at`). The code treats null `closed_at` as “not yet closed” for revenue and cycle time.
- **Targets only for 2025**: No 2026 targets exist, so 2026 quarter and trend targets are derived from 2025 data.
- **Activity–deal linkage**: Activities reference `deal_id`; if a deal is missing from `deals.json`, that activity is ignored. Account “recent activity” is inferred only via deal → account, so accounts with no deals never appear in low-activity count from this logic.
- **Segment consistency**: Account segments (SMB, Mid-Market, Enterprise) are used as-is; no validation that every deal’s `account_id` exists in `accounts.json` (missing accounts would get “Unknown” segment for stale-deal breakdown).

## What tradeoffs did you choose?

- **In-memory / JSON**: Data is loaded from JSON at startup with no SQL database. This keeps the project simple and runnable without DB setup; tradeoff is no indexing, no ad-hoc queries, and full scans for aggregations.
- **Single reference date**: Using 2026-02-03 everywhere makes “current quarter” and “last 30 days” deterministic and easy to reason about; tradeoff is the app doesn’t automatically track “today” without code/config change.
- **Summary includes trend**: The 6‑month trend (months, revenue, target) is returned inside `GET /api/summary` so the frontend can draw the trend chart with one request and the API surface stays at the four required endpoints.
- **Placeholder driver deltas**: Real period-over-period deltas would require clear definitions of “prior period” and possibly more data or caching; placeholder deltas were used so the UI can show the structure without overfitting to one definition.
- **Frontend proxy**: Vite proxies `/api` to the backend so the app works with one origin in development; production would need a similar proxy or CORS and base URL configuration.

## What would break at 10× scale?

- **Memory**: Loading all deals, activities, and accounts into memory would grow linearly; at 10× (e.g. hundreds of thousands of rows) Node’s heap could become a bottleneck and restarts would reload everything.
- **CPU**: Aggregations (filtering deals by date/stage, grouping by rep/segment, scanning activities) are O(n). At 10×, response times for `/api/summary`, `/api/drivers`, and `/api/risk-factors` would increase noticeably without indexing.
- **No caching**: Every request recomputes summary, drivers, risk factors, and recommendations; at higher QPS this would multiply CPU and memory pressure.
- **Concurrency**: A single Node process would handle all requests; no connection pooling or worker model, so latency under load would rise.
- **Mitigations**: Move to a SQL store (e.g. Postgres), add indexes on `closed_at`, `stage`, `rep_id`, `account_id`, and pre-aggregate or cache hot paths (e.g. summary and trend). Consider a separate analytics/OLAP layer for heavy aggregations.

## What did AI help with vs what you decided?

- **AI helped with**: Project layout (monorepo, backend/frontend/data), boilerplate (Express + TypeScript, Vite + React, MUI components), D3 usage (scales, axes, area/line/bar), and wiring (CORS, proxy, fetch types). Also useful for quick consistency (e.g. formatting currency, date handling).
- **I decided**: The exact semantics of “current quarter,” “stale,” “underperforming,” and “low activity” (thresholds, reference date, and how to handle nulls/missing targets). The choice to keep four API endpoints and embed trend in summary, to use in-memory JSON for simplicity, and to document assumptions and data issues in this file. The content and structure of THINKING.md itself.
