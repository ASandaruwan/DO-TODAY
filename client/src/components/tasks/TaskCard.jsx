import React, { useState } from 'react';
import {
  Calendar,
  Paperclip,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function TaskCard({ task }) {
  const { openEditTaskModal, deleteTask, updateTaskStatus } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isCompleted = task.status === 'completed';

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'pending' : 'completed';
    await updateTaskStatus(task._id, newStatus, task.order || 0);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    await deleteTask(task._id);
    setIsDeleting(false);
  };

  const priorityStyles = {
    low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
    medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    high: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40',
  };

  const statusStyles = {
    pending: 'bg-pending-bg dark:bg-amber-950/40 text-pending-text dark:text-amber-400 border-pending-border dark:border-amber-800/40',
    'in-progress': 'bg-progress-bg dark:bg-blue-950/40 text-progress-text dark:text-blue-400 border-progress-border dark:border-blue-800/40',
    completed: 'bg-completed-bg dark:bg-emerald-950/40 text-completed-text dark:text-emerald-400 border-completed-border dark:border-emerald-800/40',
  };

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <div
      onClick={() => openEditTaskModal(task)}
      className="group relative bg-surface-light dark:bg-[#1A1D27] rounded-[16px] p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle complete button */}
        <button
          type="button"
          onClick={handleToggleComplete}
          title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
          className="mt-0.5 text-content-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors focus:outline-none flex-shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-outfit font-semibold text-[17px] leading-snug text-content-strong dark:text-white truncate ${
                isCompleted ? 'line-through text-content-muted dark:text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Hover Actions: Edit & Delete */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditTaskModal(task);
                }}
                className="p-1.5 rounded-lg text-content-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(true);
                }}
                className="p-1.5 rounded-lg text-content-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1 text-sm text-content-muted dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges & Meta Row */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
            {/* Priority Badge */}
            <span
              className={`px-2.5 py-1 rounded-full font-semibold border ${
                priorityStyles[task.priority] || priorityStyles.medium
              }`}
            >
              {priorityLabels[task.priority] || 'Medium'}
            </span>

            {/* Status Badge */}
            <span
              className={`px-2.5 py-1 rounded-full font-semibold border ${
                statusStyles[task.status] || statusStyles.pending
              }`}
            >
              {statusLabels[task.status] || 'Pending'}
            </span>

            {/* Due Date Chip */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 text-content-muted dark:text-gray-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Due {formatDisplayDate(task.dueDate)}</span>
              </span>
            )}

            {/* Attachments Indicator */}
            {task.attachments && task.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800/80 text-content-muted dark:text-gray-300 font-medium">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task.attachments.length}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal / Banner */}
      {showConfirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-white dark:bg-[#1A1D27] rounded-[16px] p-4 flex flex-col items-center justify-center text-center z-10 border border-red-200 dark:border-red-900 shadow-md animate-in fade-in"
        >
          <AlertCircle className="w-6 h-6 text-primary mb-1.5" />
          <p className="text-sm font-semibold text-content-strong dark:text-white mb-2">
            Delete this task?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-content-muted hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

