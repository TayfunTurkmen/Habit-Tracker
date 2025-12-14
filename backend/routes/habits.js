const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion
} = require('../controllers/habits');

const { protect } = require('../middleware/auth');

// Re-route into other resource routers
// router.use('/:habitId/history', historyRouter);

router
  .route('/')
  .get(protect, getHabits)
  .post(protect, createHabit);

router
  .route('/:id')
  .get(protect, getHabit)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

router
  .route('/:id/complete')
  .put(protect, toggleHabitCompletion);

module.exports = router;
