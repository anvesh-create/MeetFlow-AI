const express = require('express');
const controller = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(requireAuth); router.get('/', controller.listTasks); router.post('/', controller.createTask); router.get('/:id', controller.getTask); router.put('/:id', controller.updateTask); router.delete('/:id', controller.deleteTask); router.patch('/:id/status', controller.updateStatus);
module.exports = router;
