import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  Settings,
  CheckCheck,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    dismissNotification,
    dismissAll,
  } = useNotifications();

  const { openEditTaskModal, updateTaskStatus } = useTasks();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick mark completed from notification
  const handleQuickComplete = async (e, task) => {
    e.stopPropagation();
    const taskId = task._id || task.id;
    try {
      const res = await updateTaskStatus(taskId, 'completed', task.order || 0);
      if (res?.success) {
        toast.success(`Completed "${task.title}"!`);
      } else {
        toast.error('Failed to complete task');
      }
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const handleOpenTask = (task) => {
    setIsOpen(false);
    openEditTaskModal(task);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'overdue':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />,
          bgColor: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
          label: 'Overdue',
        };
      case 'due-today':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          label: 'Due Today',
        };
      case 'due-soon':
      default:
        return {
          icon: <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
          label: 'Approaching',
        };
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Approaching Deadlines & Notifications"
        className="relative w-10 h-10 rounded-[12px] flex items-center justify-center text-[#374151] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] rounded-full bg-primary/40 animate-ping" />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1A1D27] shadow-2xl border border-border-light dark:border-border-dark py-3 z-50 animate-in fade-in-50 zoom-in-95 overflow-hidden">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-outfit font-bold text-base text-content-strong dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={dismissAll}
                  className="text-xs text-content-muted hover:text-content-strong dark:hover:text-white px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 font-medium"
                  title="Dismiss all notifications"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Dismiss All</span>
                </button>
              )}
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* List of Notification Items */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border-light/60 dark:divide-border-dark/60">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-outfit font-semibold text-sm text-content-strong dark:text-white">
                  All caught up!
                </p>
                <p className="text-xs text-content-muted dark:text-gray-400 mt-0.5">
                  No approaching deadlines or overdue tasks.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const badge = getTypeBadge(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenTask(item.task)}
                    className="p-3.5 hover:bg-[#FAF9F5] dark:hover:bg-[#151822] cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex-shrink-0">{badge.icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge.bgColor}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-content-muted dark:text-gray-400">
                          {formatDisplayDate(item.dueDate)}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-content-strong dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-content-muted dark:text-gray-400 line-clamp-1 mt-0.5">
                        {item.message}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleQuickComplete(e, item.task)}
                        className="p-1 rounded text-content-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Mark task completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(item.id);
                        }}
                        className="p-1 rounded text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Dismiss notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 pt-2.5 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-content-muted dark:text-gray-400">
              <span>Click a task to view details</span>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-primary hover:underline font-medium"
              >
                Go to Dashboard →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
