const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
async function stats(req, res, next) { try { const owner = { createdBy: req.user._id }; const [totalMeetings, totalTasks, pendingTasks, completedTasks, unreadNotifications] = await Promise.all([Meeting.countDocuments(owner), Task.countDocuments(owner), Task.countDocuments({ ...owner, status: { $in: ['Pending', 'Assigned', 'In Progress'] } }), Task.countDocuments({ ...owner, status: 'Completed' }), Notification.countDocuments({ userId: req.user._id, read: false })]); res.json({ stats: { totalMeetings, totalTasks, pendingTasks, completedTasks, unreadNotifications } }); } catch (error) { next(error); } }

async function overview(req, res, next) {
	try {
		const owner = { createdBy: req.user._id };
		const now = new Date();
		const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
		const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
		const [base, meetingsToday, overdueTasks, recentMeetings, upcomingMeetings, recentTasks, team] = await Promise.all([
			Promise.all([Meeting.countDocuments(owner), Task.countDocuments(owner), Task.countDocuments({ ...owner, status: { $in: ['Pending', 'Assigned', 'In Progress'] } }), Task.countDocuments({ ...owner, status: 'Completed' }), Notification.countDocuments({ userId: req.user._id, read: false })]),
			Meeting.countDocuments({ ...owner, meetingDate: { $gte: todayStart, $lt: tomorrow } }),
			Task.countDocuments({ ...owner, deadline: { $lt: now }, status: { $ne: 'Completed' } }),
			Meeting.find(owner).sort({ meetingDate: -1 }).limit(5).select('title meetingDate summary analysisStatus participants'),
			Meeting.find({ ...owner, meetingDate: { $gte: now } }).sort({ meetingDate: 1 }).limit(5).select('title meetingDate participants'),
			Task.find(owner).populate('meetingId', 'title').sort({ createdAt: -1 }).limit(6),
			Task.aggregate([{ $match: owner }, { $group: { _id: '$owner', assigned: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }, overdue: { $sum: { $cond: [{ $and: [{ $lt: ['$deadline', now] }, { $ne: ['$status', 'Completed'] }] }, 1, 0] } } } }, { $sort: { completed: -1, assigned: -1 } }])
		]);
		const [totalMeetings, totalTasks, pendingTasks, completedTasks, unreadNotifications] = base;
		res.json({ overview: { stats: { totalMeetings, totalTasks, pendingTasks, completedTasks, unreadNotifications, meetingsToday, overdueTasks, completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0 }, recentMeetings, upcomingMeetings, recentTasks, team } });
	} catch (error) { next(error); }
}
module.exports = { stats, overview };
