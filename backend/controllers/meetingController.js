const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { analyzeTranscript } = require('../services/aiService');
const { dispatchTasks } = require('../services/dispatcherService');

async function createMeeting(req, res, next) {
  try {
    const { title, transcript, participants = [], meetingDate } = req.body;
    if (!title || !transcript || !meetingDate) return res.status(400).json({ message: 'Title, transcript, and meeting date are required.' });
    const meeting = await Meeting.create({ title, transcript, participants: Array.isArray(participants) ? participants : String(participants).split(',').map(value => value.trim()).filter(Boolean), meetingDate, createdBy: req.user._id });
    res.status(201).json({ meeting });
  } catch (error) { next(error); }
}

async function listMeetings(req, res, next) { try { res.json({ meetings: await Meeting.find({ createdBy: req.user._id }).sort({ createdAt: -1 }) }); } catch (error) { next(error); } }
async function getMeeting(req, res, next) {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });
    const tasks = await Task.find({ meetingId: meeting._id, createdBy: req.user._id }).sort({ createdAt: 1 });
    res.json({ meeting, tasks });
  } catch (error) { next(error); }
}
async function deleteMeeting(req, res, next) {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });
    await Task.deleteMany({ meetingId: meeting._id, createdBy: req.user._id });
    await Notification.deleteMany({ meetingId: meeting._id, userId: req.user._id });
    res.json({ message: 'Meeting deleted.' });
  } catch (error) { next(error); }
}
async function analyzeMeeting(req, res, next) {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' });
    meeting.analysisStatus = 'Processing'; meeting.analysisError = ''; await meeting.save();
    const result = await analyzeTranscript(meeting.transcript);
    meeting.summary = result.summary; meeting.decisions = result.decisions; meeting.analysisStatus = 'Completed'; await meeting.save();
    const dispatched = await dispatchTasks({ meeting, tasks: result.tasks, userId: req.user._id });
    await Notification.create({ userId: req.user._id, meetingId: meeting._id, type: 'analysis_complete', title: 'Meeting analysis complete.', message: `${dispatched.length} action items were created and dispatched.` });
    res.json({ meeting, tasks: dispatched.map(item => item.task), analysis: result, dispatchMode: result.mode === 'live' ? 'Live AI analysis' : 'Demo AI Mode — configure AI_API_KEY for live AI analysis.' });
  } catch (error) {
    if (req.params.id) await Meeting.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, { analysisStatus: 'Failed', analysisError: 'AI analysis is temporarily unavailable. Check your AI provider configuration and try again.' });
    error.statusCode = 503;
    error.message = 'AI analysis is temporarily unavailable. Check your AI provider configuration and try again.';
    next(error);
  }
}
module.exports = { createMeeting, listMeetings, getMeeting, deleteMeeting, analyzeMeeting };
