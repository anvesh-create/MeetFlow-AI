require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim()) : null;
app.use(cors({ origin: allowedOrigins ? (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) : true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MeetFlow AI' }));
app.use('/api/auth', authRoutes); app.use('/api/meetings', meetingRoutes); app.use('/api/tasks', taskRoutes); app.use('/api/notifications', notificationRoutes); app.use('/api/dashboard', dashboardRoutes);
const pageRoutes = { '/': 'index.html', '/login': 'login.html', '/signup': 'signup.html', '/dashboard': 'dashboard.html', '/meetings': 'meetings.html', '/tasks': 'tasks.html', '/team': 'team.html', '/performance': 'performance.html', '/reports': 'reports.html', '/notifications': 'notifications.html', '/settings': 'settings.html', '/meeting-room': 'meeting-room.html' };
Object.entries(pageRoutes).forEach(([route, file]) => app.get(route, (req, res) => res.sendFile(path.join(__dirname, '..', file))));
app.get('/meetings/:id/analysis', (req, res) => res.redirect(`/meeting/${req.params.id}`));
app.get('/team/:id', (req, res) => res.sendFile(path.join(__dirname, '..', 'team.html')));
app.get('/tasks/:id', (req, res) => res.sendFile(path.join(__dirname, '..', 'tasks.html')));
app.get(['/meeting/:id', '/meetings/:id'], (req, res) => res.sendFile(path.join(__dirname, '..', 'meeting.html')));
app.use(express.static(path.join(__dirname, '..')));
app.use(notFound); app.use(errorHandler);

async function start() {
  await connectDatabase();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`MeetFlow AI running on port ${port}`));
}
if (require.main === module) start().catch(error => { console.error(`Startup failed: ${error.message}`); process.exit(1); });
module.exports = app;
