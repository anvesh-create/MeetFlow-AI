# MeetFlow AI

### AI-Powered Post-Meeting Action Management Platform

MeetFlow AI transforms meeting outcomes into actionable tasks, notifications, and follow-ups, helping teams move from discussion to execution.

**Live Demo:** https://meetflow-ai-1pv2.onrender.com

---

## Key Features

- AI-powered meeting transcript analysis
- Automatic meeting summaries and decisions
- Actionable task creation and tracking
- In-app notifications
- Optional email notifications
- JWT-based authentication
- User and meeting management
- Task and performance tracking

---

## Product Flow

**Meeting → Transcript → AI Analysis → Summary + Decisions → Tasks → Dispatcher → Notifications / Email → Tracking**

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT + bcryptjs
- **AI:** Configurable LLM HTTP API
- **Email:** Nodemailer SMTP
- **Deployment:** Render

---

## Setup

1. Install Node.js 18+.
2. Create a MongoDB Atlas database or run MongoDB locally.
3. Copy `.env.example` to `.env`.
4. Configure `MONGODB_URI` and a strong `JWT_SECRET`.
5. Install dependencies:

```bash
npm install
