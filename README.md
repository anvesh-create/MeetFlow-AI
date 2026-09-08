# MeetFlow AI

MeetFlow AI turns every meeting into action. It stores meeting transcripts in MongoDB, analyzes them through a backend LLM service, creates owned tasks, dispatches in-app notifications, and optionally sends SMTP email.

## Product flow

`Meeting -> Transcript -> AI analysis -> Summary + decisions -> Tasks -> Dispatcher -> Notifications/email -> Tracking`

## Stack

- Vanilla HTML/CSS/JavaScript frontend
- Node.js and Express API
- MongoDB and Mongoose persistence
- JWT authentication with bcryptjs password hashing
- Configurable LLM HTTP API
- Nodemailer SMTP adapter

## Setup

1. Install Node.js 18+ and create a MongoDB Atlas database or run MongoDB locally.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Install dependencies: `npm install`.
4. Start development mode: `npm run dev`.
5. Open `http://localhost:5000/index.html`.

The API refuses to start without `MONGODB_URI`, so database-backed behavior cannot silently fall back to browser storage.

## Environment variables

`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` are supported. Never commit `.env`.

## AI and email modes

Without `AI_API_KEY`, analysis uses an explicitly labeled demo parser so the complete transcript-to-task UI can be exercised. Configure `AI_API_KEY` for live structured LLM analysis; the key remains server-side. Without complete SMTP variables, in-app notifications are persisted and tasks show `Email unavailable`; no email is claimed as sent.

## API

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/meetings`, `GET /api/meetings`, `GET /api/meetings/:id`, `DELETE /api/meetings/:id`, `POST /api/meetings/:id/analyze`
- `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status`
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`
- `GET /api/dashboard/stats`

Protected endpoints use `Authorization: Bearer <JWT>`.

## Deployment

Deploy the Node service to Render, Railway, or a similar platform with the environment variables configured and MongoDB Atlas network access enabled. Set `CLIENT_ORIGIN` to the deployed frontend origin. Because Express serves the root frontend, one service can host both for a straightforward deployment; a separate static host can also use the same API base URL.

## Future improvements

Add calendar integrations, workspace membership and role permissions, background job retries, webhook-based meeting ingestion, richer owner directory matching, and audit logs.
