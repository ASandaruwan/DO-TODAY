import { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Paperclip,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  AlertCircle,
  Eye,
  Download,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  Check,
  Repeat,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  getAttachmentUrl,
  isImageAttachment,
  formatFileSize,
} from '../../utils/attachmentUtils';
import AttachmentPreviewModal from '../common/AttachmentPreviewModal';

export default function TaskCard({
  task,
  isDragging = false,
  innerRef,
  draggableProps,
  dragHandleProps,
  className = '',
}) {
  const { openEditTaskModal, deleteTask, updateTaskStatus, toggleSubtask } = useTasks();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAttachmentsMenu, setShowAttachmentsMenu] = useState(false);
  const [showSubtasksMenu, setShowSubtasksMenu] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const attachmentsRef = useRef(null);
  const subtasksRef = useRef(null);

  const taskId = task?._id || task?.id;
  const isCompleted = task?.status === 'completed';

  // Close menus when clicking outside
  useEffect(() => {
    if (!showAttachmentsMenu && !showSubtasksMenu) return;
    const handleClickOutside = (e) => {
      if (attachmentsRef.current && !attachmentsRef.current.contains(e.target)) {
        setShowAttachmentsMenu(false);
      }
      if (subtasksRef.current && !subtasksRef.current.contains(e.target)) {
        setShowSubtasksMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachmentsMenu, showSubtasksMenu]);

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'pending' : 'completed';
    await updateTaskStatus(taskId, newStatus, task.order || 0);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    const res = await deleteTask(taskId);
    if (res?.success) {
      toast.success('Task deleted successfully');
    } else {
      toast.error(res?.error || 'Failed to delete task');
    }
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

  const attachments = Array.isArray(task?.attachments) ? task.attachments : [];
  const imageAttachments = attachments.filter(isImageAttachment);

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => openEditTaskModal(task)}
      className={`group relative bg-surface-light dark:bg-[#1A1D27] rounded-[16px] p-5 border transition-all duration-200 cursor-pointer ${
        isDragging
          ? 'shadow-2xl border-primary ring-2 ring-primary/40 rotate-[1deg] scale-[1.02] z-50'
          : 'border-border-light dark:border-border-dark shadow-sm hover:shadow-md'
      } ${className}`}
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

          {/* Attached Images Thumbnail Bar */}
          {imageAttachments.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto py-1">
              {imageAttachments.slice(0, 3).map((att, idx) => {
                const url = getAttachmentUrl(att.url);
                return (
                  <button
                    key={att._id || att.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewAttachment(att);
                    }}
                    className="relative group/thumb w-14 h-14 rounded-xl overflow-hidden border border-border-light dark:border-border-dark flex-shrink-0 bg-black/5 hover:ring-2 hover:ring-primary transition-all"
                    title={`View ${att.filename}`}
                  >
                    <img
                      src={url}
                      alt={att.filename}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </button>
                );
              })}
              {imageAttachments.length > 3 && (
                <span className="text-xs font-semibold text-content-muted">
                  +{imageAttachments.length - 3} more
                </span>
              )}
            </div>
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

            {/* Recurrence Chip */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 font-medium capitalize text-xs"
                title={`Repeats ${task.recurrence}`}
              >
                <Repeat className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{task.recurrence}</span>
              </span>
            )}

            {/* Subtasks Interactive Pill */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="relative" ref={subtasksRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtasksMenu((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-medium transition-colors cursor-pointer"
                  title="Click to view & toggle subtasks"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  </span>
                </button>

                {/* Subtasks Popover Dropdown */}
                {showSubtasksMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1A1D27] rounded-xl shadow-xl border border-border-light dark:border-border-dark p-2.5 z-30 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-1">
                      <span>Checklist</span>
                      <span>
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {task.subtasks.map((st, idx) => (
                        <button
                          key={st._id || st.id || idx}
                          type="button"
                          onClick={() => toggleSubtask(taskId, st._id || st.id)}
                          className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs text-left transition-colors"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                              st.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-border-light dark:border-border-dark bg-white dark:bg-[#13151F]'
                            }`}
                          >
                            {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`truncate ${
                              st.completed
                                ? 'line-through text-content-muted dark:text-gray-500'
                                : 'text-content-strong dark:text-white'
                            }`}
                          >
                            {st.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Interactive Button */}
            {attachments.length > 0 && (
              <div className="relative" ref={attachmentsRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAttachmentsMenu((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 text-content-muted hover:text-content-strong dark:text-gray-300 font-medium transition-colors cursor-pointer"
                  title="Click to view attachments"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachments.length}</span>
                </button>

                {/* Attachments Popover Dropdown */}
                {showAttachmentsMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1A1D27] rounded-xl shadow-xl border border-border-light dark:border-border-dark p-2.5 z-30 animate-in fade-in"
                  >
                    <div className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-1">
                      Attachments ({attachments.length})
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {attachments.map((att, idx) => {
                        const url = getAttachmentUrl(att.url);
                        const isImg = isImageAttachment(att);

                        return (
                          <div
                            key={att._id || att.id || idx}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                              {isImg ? (
                                <ImageIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              )}
                              <span
                                className="truncate font-medium text-content-strong dark:text-white"
                                title={att.filename}
                              >
                                {att.filename}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAttachmentsMenu(false);
                                  setPreviewAttachment(att);
                                }}
                                className="p-1 text-content-muted hover:text-primary transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={url}
                                download={att.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-content-muted hover:text-content-strong dark:hover:text-white transition-colors"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtask Progress Bar */}
          {((typeof task.progress === 'number' && task.progress > 0) || (task.subtasks && task.subtasks.length > 0)) && (
            <div className="mt-3.5 pt-2 border-t border-border-light/60 dark:border-border-dark/60">
              <div className="flex items-center justify-between text-[11px] text-content-muted dark:text-gray-400 font-medium mb-1">
                <span>Progress</span>
                <span>{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            </div>
          )}
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

      {/* Lightbox / Attachment Preview Modal */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  );
}
