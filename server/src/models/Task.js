const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    publicId: { type: String, default: null },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast user-scoped queries
taskSchema.index({ user: 1, status: 1, order: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ title: 'text', description: 'text' });

taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

