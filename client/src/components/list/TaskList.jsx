import { useState, useMemo } from 'react';
import {
  Calendar,
  Paperclip,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Clock,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatDisplayDate } from '../../utils/dateUtils';

const priorityOrder = { high: 3, medium: 2, low: 1 };
const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 };

export default function TaskList({ onShowToast }) {
  const { tasks, updateTaskStatus, deleteTask, openEditTaskModal, openNewTaskModal, resetFilters } =
    useTasks();

  const [sortField, setSortField] = useState('dueDate'); // 'title' | 'priority' | 'status' | 'dueDate'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [deletingId, setDeletingId] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    return [...tasks].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortField === 'priority') {
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        comparison = pA - pB;
      } else if (sortField === 'status') {
        const sA = statusOrder[a.status] || 0;
        const sB = statusOrder[b.status] || 0;
        comparison = sA - sB;
      } else if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortDirection]);

  const handleToggleStatus = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const res = await updateTaskStatus(task._id, newStatus, task.order || 0);
    if (!res?.success) {
      onShowToast?.(res?.error || 'Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    const res = await deleteTask(id);
    setDeletingId(null);
    if (!res?.success) {
      onShowToast?.(res?.error || 'Failed to delete task', 'error');
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
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

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-content-muted dark:text-gray-400 opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1D27] rounded-[20px] p-12 border border-border-light dark:border-border-dark shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-primary-soft dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-1">
          No tasks found
        </h3>
        <p className="text-content-muted dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Try adjusting your filters or create a new task to get started.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border-light dark:border-border-dark text-content-strong dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={() => openNewTaskModal()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-btn-red transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-[20px] border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-[#FAFAFA] dark:bg-[#151722]/80 text-xs font-semibold text-content-muted dark:text-gray-400 uppercase tracking-wider select-none">
              <th scope="col" className="w-12 py-4 pl-6 pr-2">
                <span className="sr-only">Toggle Status</span>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('title')}
                className="py-4 px-4 cursor-pointer hover:text-content-strong dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('priority')}
                className="py-4 px-4 cursor-pointer hover:text-content-strong dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('status')}
                className="py-4 px-4 cursor-pointer hover:text-content-strong dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('dueDate')}
                className="py-4 px-4 cursor-pointer hover:text-content-strong dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  {renderSortIcon('dueDate')}
                </div>
              </th>
              <th scope="col" className="py-4 px-4">
                <span>Files</span>
              </th>
              <th scope="col" className="py-4 pr-6 pl-4 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/60">
            {sortedTasks.map((task) => {
              const isDone = task.status === 'completed';
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <tr
                  key={task._id}
                  onClick={() => openEditTaskModal(task)}
                  className="group hover:bg-[#FAF9F5] dark:hover:bg-[#1F2330]/50 transition-colors cursor-pointer"
                >
                  {/* Status Toggle Checkbox */}
                  <td className="py-4 pl-6 pr-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(task, e)}
                      title={isDone ? 'Mark Pending' : 'Mark Completed'}
                      className="text-content-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors focus:outline-none"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-4 px-4 max-w-md">
                    <div className="font-outfit font-semibold text-base text-content-strong dark:text-white truncate">
                      <span className={isDone ? 'line-through text-content-muted dark:text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-content-muted dark:text-gray-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Priority Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        priorityStyles[task.priority] || priorityStyles.medium
                      }`}
                    >
                      {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        statusStyles[task.status] || statusStyles.pending
                      }`}
                    >
                      {statusLabels[task.status] || 'Pending'}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          overdue
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-content-muted dark:text-gray-300'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDisplayDate(task.dueDate)}</span>
                        {overdue && <span className="text-[11px] font-bold uppercase">(Overdue)</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-content-muted dark:text-gray-500">—</span>
                    )}
                  </td>

                  {/* Attachments */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {task.attachments && task.attachments.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-content-muted dark:text-gray-300 text-xs font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{task.attachments.length}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-content-muted dark:text-gray-500">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
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
                        disabled={deletingId === task._id}
                        onClick={(e) => handleDelete(task._id, e)}
                        className="p-1.5 rounded-lg text-content-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
