const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  completeTask,
  deleteTask,
} = require('../controllers/taskController');

router.route('/').post(createTask).get(getTasks);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.route('/:id/complete').put(completeTask);

module.exports = router;
