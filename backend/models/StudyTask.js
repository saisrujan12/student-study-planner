const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      validate: {
        validator: function (v) {
          return v && v.trim().length >= 2;
        },
        message: 'Title must contain at least 2 non-whitespace characters',
      },
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority. Use Low, Medium, or High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    estimatedMinutes: {
      type: Number,
      required: [true, 'Estimated study time is required'],
      min: [1, 'Estimated study time must be at least 1 minute'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware: trim title and validate non-whitespace
studyTaskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.subject) {
    this.subject = this.subject.trim();
  }
  next();
});

module.exports = mongoose.model('StudyTask', studyTaskSchema);
