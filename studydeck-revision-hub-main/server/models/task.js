const mongoose = require('mongoose');

// Task schema for individual tasks
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// UserTasks schema to store all tasks and completion status
const UserTasksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  events: {
    type: Map,
    of: [{
      text: {
        type: String,
        required: true
      },
      class: {
        type: String,
        default: null
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  doneMap: {
    type: Map,
    of: [Boolean]
  },
  classes: {
    type: [String],
    default: ['codeforces']
  },
  days: {
    type: Map,
    of: {
      type: String,
      enum: ['work', 'vacation', 'sickness']
    },
    default: () => {
      const now = new Date();
      const result = {};
      for (let i = 1; i <= 31; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), i);
        if (i % 6 === 0) result[date.toDateString()] = 'vacation';
        else if (i % 13 === 0) result[date.toDateString()] = 'sickness';
        else result[date.toDateString()] = 'work';
      }
      return result;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    virtuals: true
  }
});


// Create indexes for better performance
UserTasksSchema.index({ userId: 1, 'events._id': 1 });
UserTasksSchema.index({ userId: 1, 'doneMap._id': 1 });

// Export both models
const TaskModel = mongoose.model('Task', taskSchema);
const UserTasksModel = mongoose.model('UserTasks', UserTasksSchema);

// Export using the original names for compatibility
module.exports = { Task: TaskModel, UserTasks: UserTasksModel };


  
