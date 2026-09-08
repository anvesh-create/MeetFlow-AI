const express = require('express');
const controller = require('../controllers/meetingController');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(requireAuth); router.post('/', controller.createMeeting); router.get('/', controller.listMeetings); router.get('/:id', controller.getMeeting); router.delete('/:id', controller.deleteMeeting); router.post('/:id/analyze', controller.analyzeMeeting);
module.exports = router;
