const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.EMAIL_FROM);
}

async function sendTaskEmail({ task, meeting }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'Email service not configured — notification stored in MeetFlow AI.' };
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Not specified';
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: task.ownerEmail, subject: 'MeetFlow AI — New Task Assigned', text: `Hello ${task.owner},\n\nYou have been assigned a new task from ${meeting.title}:\n\n${task.title}\n\nDeadline: ${deadline}\nPriority: ${task.priority}\nDescription: ${task.description || 'See the task in MeetFlow AI.'}\n\n— MeetFlow AI` });
  return { sent: true };
}

module.exports = { sendTaskEmail, isEmailConfigured };
