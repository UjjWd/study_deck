const express = require('express');
const router = express.Router();
const { Task, UserTasks } = require('../models/task');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// Get user's tasks, doneMap, and days
router.get('/tasks', verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'No user ID provided' });
    }

    // Find or create user's tasks
    let userTasks = await UserTasks.findOne({ userId: req.userId });
    if (!userTasks) {
      userTasks = new UserTasks({ userId: req.userId });
      await userTasks.save();
    }

    res.json({
      events: userTasks.events || {},
      doneMap: userTasks.doneMap || {},
      classes: userTasks.classes || [],
      days: userTasks.days || {}
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update tasks, doneMap, classes, and days
router.post('/tasks', verifyToken, async (req, res) => {
  try {
    const { events, doneMap, classes, days } = req.body;
    
    // Find or create user's tasks
    let userTasks = await UserTasks.findOne({ userId: req.userId });
    if (!userTasks) {
      userTasks = new UserTasks({ userId: req.userId });
    }

    // Update all fields from request body
    if (events !== undefined) userTasks.events = events;
    if (doneMap !== undefined) userTasks.doneMap = doneMap;
    if (classes !== undefined) userTasks.classes = classes;
    if (days !== undefined) userTasks.days = days;

    // Save and return the updated user tasks
    await userTasks.save();
    res.json({
      events: userTasks.events,
      doneMap: userTasks.doneMap,
      classes: userTasks.classes,
      days: userTasks.days
    });
  } catch (error) {
    console.error('Error updating tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task completion status
router.put('/tasks/:date/:index', verifyToken, async (req, res) => {
  try {
    const { date, index } = req.params;
    const { isCompleted } = req.body;
    const dayStr = new Date(date).toDateString();

    const userTasks = await UserTasks.findOne({ userId: req.userId });
    if (!userTasks) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    if (!userTasks.events.has(dayStr)) {
      return res.status(404).json({ message: 'No tasks for this date' });
    }

    const tasks = userTasks.events.get(dayStr);
    if (!tasks || index >= tasks.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task
    tasks[index].isCompleted = isCompleted;
    // Update doneMap
    userTasks.doneMap.get(dayStr)[index] = isCompleted;

    await userTasks.save();
    res.json({
      events: userTasks.events,
      doneMap: userTasks.doneMap
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/tasks/:date/:index', verifyToken, async (req, res) => {
  try {
    const { date, index } = req.params;
    const dayStr = new Date(date).toDateString();

    const userTasks = await UserTasks.findOne({ userId: req.userId });
    if (!userTasks) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    if (!userTasks.events.has(dayStr)) {
      return res.status(404).json({ message: 'No tasks for this date' });
    }

    const tasks = userTasks.events.get(dayStr);
    const doneMap = userTasks.doneMap.get(dayStr);

    if (!tasks || index >= tasks.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task and corresponding doneMap entry
    tasks.splice(index, 1);
    doneMap.splice(index, 1);

    // Clean up empty arrays
    if (tasks.length === 0) {
      userTasks.events.delete(dayStr);
      userTasks.doneMap.delete(dayStr);
    }

    await userTasks.save();
    res.json({
      events: userTasks.events,
      doneMap: userTasks.doneMap
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks for a date range
router.get('/tasks-range', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const tasks = await Task.find({
      userId: req.userId,
      date: { $gte: start, $lte: end }
    }).populate('label');

    // Group tasks by date
    const groupedTasks = {};
    tasks.forEach(task => {
      const dateStr = task.formattedDate;
      if (!groupedTasks[dateStr]) {
        groupedTasks[dateStr] = [];
      }
      groupedTasks[dateStr].push(task);
    });
    
    res.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Add multiple tasks
router.post('/tasks/batch', verifyToken, async (req, res) => {
  try {
    const { date, tasks } = req.body;
    
    const newTasks = await Promise.all(tasks.map(taskData => {
      return Task.create({
        userId: req.userId,
        date: new Date(date),
        text: taskData.text,
        category: taskData.category,
        label: taskData.label,
        isCompleted: false
      });
    }));

    res.status(201).json(newTasks);
  } catch (error) {
    console.error('Error creating tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.userId },
      updates,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
