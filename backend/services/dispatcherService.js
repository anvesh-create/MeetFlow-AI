const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendTaskEmail } = require('./emailService');

async function dispatchTasks({ meeting, tasks, userId }) {
  const created = [];
  for (const item of tasks) {
    if (!item.title || !item.owner) continue;
    const task = await Task.create({ title: item.title, description: item.description || '', owner: item.owner, ownerEmail: item.ownerEmail || undefined, deadline: item.deadline || undefined, priority: ['Low', 'Medium', 'High'].includes(item.priority) ? item.priority : 'Medium', status: item.owner === 'Team' ? 'Pending' : 'Assigned', meetingId: meeting._id, createdBy: userId });
    const notification = await Notification.create({ userId, taskId: task._id, meetingId: meeting._id, type: 'task_assigned', title: `${task.owner} was assigned ${task.title}.`, message: `${task.owner}, you own ${task.title}. Open the task board for the deadline and details.` });
    let dispatchStatus = 'Notification created';
    if (task.ownerEmail) {
      try {
        const email = await sendTaskEmail({ task, meeting });
        dispatchStatus = email.sent ? 'Email sent' : 'Email unavailable';
      } catch (error) {
        dispatchStatus = 'Email failed';
      }
    } else {
      dispatchStatus = 'Email unavailable';
    }
    task.dispatched = true;
    task.dispatchStatus = dispatchStatus;
    await task.save();
    created.push({ task, notification });
  }
  return created;
}

module.exports = { dispatchTasks };
