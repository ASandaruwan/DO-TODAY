import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export default function TaskModal() {
  const {
    isNewTaskModalOpen,
    closeNewTaskModal,
    editingTask,
    modalPrefilledDate,
    createTask,
    updateTask,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync form when opening / changing task
  useEffect(() => {
    if (isNewTaskModalOpen) {
      setFormError('');
      if (editingTask) {
        setTitle(editingTask.title || '');
        setDescription(editingTask.description || '');
        setStatus(editingTask.status || 'pending');
        setPriority(editingTask.priority || 'medium');
        setStartDate(
          editingTask.startDate ? editingTask.startDate.substring(0, 10) : ''
        );
        setDueDate(
          editingTask.dueDate ? editingTask.dueDate.substring(0, 10) : ''
        );
      } else {
        setTitle('');
        setDescription('');
        setStatus('pending');
        setPriority('medium');
        setStartDate(modalPrefilledDate || '');
        setDueDate(modalPrefilledDate || '');
      }
    }
  }, [isNewTaskModalOpen, editingTask, modalPrefilledDate]);

  if (!isNewTaskModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
    };

    let result;
    if (editingTask) {
      result = await updateTask(editingTask._id, payload);
    } else {
      result = await createTask(payload);
    }

    setSubmitting(false);

    if (result.success) {
      closeNewTaskModal();
    } else {
      setFormError(result.error || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1A1D27] w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={closeNewTaskModal}
            className="text-content-muted hover:text-content-strong dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-primary border border-red-200 dark:border-red-900/50 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
              Task Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page"
              className="w-full h-11 px-3.5 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white placeholder:text-content-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes or links..."
              className="w-full p-3 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white placeholder:text-content-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 px-3 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-3 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={closeNewTaskModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-content-muted hover:text-content-strong dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-btn-red disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
