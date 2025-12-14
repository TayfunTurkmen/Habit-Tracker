const Habit = require('../models/Habit');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all habits for a user
// @route   GET /api/v1/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
// @access  Private
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return next(
        new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new habit
// @route   POST /api/v1/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const habit = await Habit.create(req.body);

    res.status(201).json({
      success: true,
      data: habit
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update habit
// @route   PUT /api/v1/habits/:id
// @access  Private
exports.updateHabit = async (req, res, next) => {
  try {
    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      return next(
        new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is habit owner
    if (habit.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this habit`,
          401
        )
      );
    }

    habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete habit
// @route   DELETE /api/v1/habits/:id
// @access  Private
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return next(
        new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is habit owner
    if (habit.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this habit`,
          401
        )
      );
    }

    await habit.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle habit completion for today
// @route   PUT /api/v1/habits/:id/complete
// @access  Private
exports.toggleHabitCompletion = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return next(
        new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is habit owner
    if (habit.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this habit`,
          401
        )
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if habit was already completed today
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
    const wasCompletedToday = lastCompleted && lastCompleted >= today;

    if (wasCompletedToday) {
      // If completed today, undo the completion
      habit.streak = Math.max(0, habit.streak - 1);
      habit.lastCompleted = null;
    } else {
      // If not completed today, mark as completed
      habit.streak = (habit.streak || 0) + 1;
      habit.lastCompleted = new Date();
    }

    await habit.save();

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (err) {
    next(err);
  }
};
