const Notification = require('../models/Notification');
async function listNotifications(req, res, next) { try { res.json({ notifications: await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50) }); } catch (error) { next(error); } }
async function markRead(req, res, next) { try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true }); if (!notification) return res.status(404).json({ message: 'Notification not found.' }); res.json({ notification }); } catch (error) { next(error); } }
module.exports = { listNotifications, markRead };
