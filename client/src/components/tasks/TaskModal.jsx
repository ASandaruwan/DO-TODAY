import { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  CheckSquare,
  Plus,
  Check,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import {
  getAttachmentUrl,
  isImageAttachment,
  isPdfAttachment,
  formatFileSize,
} from '../../utils/attachmentUtils';
import AttachmentPreviewModal from '../common/AttachmentPreviewModal';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

export default function TaskModal() {
  const {
    isNewTaskModalOpen,
    closeNewTaskModal,
    editingTask,
    modalPrefilledDate,
    createTask,
    updateTask,
    deleteAttachment,
  } = useTasks();

  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  // Sync form when opening / changing task
  useEffect(() => {
    if (isNewTaskModalOpen) {
      setFormError('');
      setSelectedFiles([]);
      setNewSubtaskTitle('');
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
        setExistingAttachments(editingTask.attachments || []);
        setSubtasks(
          Array.isArray(editingTask.subtasks)
            ? editingTask.subtasks.map((s) => ({
                _id: s._id || s.id,
                title: s.title || '',
                completed: Boolean(s.completed),
              }))
            : []
        );
        setProgress(typeof editingTask.progress === 'number' ? editingTask.progress : 0);
      } else {
        setTitle('');
        setDescription('');
        setStatus('pending');
        setPriority('medium');
        setStartDate(modalPrefilledDate || '');
        setDueDate(modalPrefilledDate || '');
        setExistingAttachments([]);
        setSubtasks([]);
        setProgress(0);
      }
    }
  }, [isNewTaskModalOpen, editingTask, modalPrefilledDate]);

  if (!isNewTaskModalOpen) return null;

  // File validation & adding
  const handleFiles = (incomingFiles) => {
    setFormError('');
    const newFiles = Array.from(incomingFiles);

    const totalCount = existingAttachments.length + selectedFiles.length + newFiles.length;
    if (totalCount > MAX_FILES) {
      setFormError(`Maximum ${MAX_FILES} attachments allowed per task.`);
      return;
    }

    const validFiles = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFormError(`Invalid file format "${file.name}". Only PDF, PNG, JPG, and WebP are allowed.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError(`File "${file.name}" exceeds the 5 MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDeleteExistingAttachment = async (attachmentId) => {
    const taskId = editingTask?._id || editingTask?.id;
    if (!taskId) return;
    try {
      const res = await deleteAttachment(taskId, attachmentId);
      if (res.success) {
        setExistingAttachments((prev) =>
          prev.filter((a) => a._id !== attachmentId && a.id !== attachmentId)
        );
        toast.info('Attachment removed');
      } else {
        setFormError(res.error || 'Failed to remove attachment');
      }
    } catch {
      setFormError('Failed to remove attachment');
    }
  };

  const handleAddSubtask = (e) => {
    if (e) e.preventDefault();
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    const updated = [
      ...subtasks,
      {
        _id: 'temp-' + Date.now(),
        title: trimmed,
        completed: false,
      },
    ];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    const done = updated.filter((s) => s.completed).length;
    setProgress(Math.round((done / updated.length) * 100));
  };

  const handleToggleSubtask = (index) => {
    const updated = subtasks.map((s, idx) =>
      idx === index ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    const done = updated.filter((s) => s.completed).length;
    const newProg = Math.round((done / updated.length) * 100);
    setProgress(newProg);
    if (newProg === 100 && status !== 'completed') {
      setStatus('completed');
    } else if (newProg < 100 && status === 'completed') {
      setStatus('in-progress');
    }
  };

  const handleRemoveSubtask = (index) => {
    const updated = subtasks.filter((_, idx) => idx !== index);
    setSubtasks(updated);
    if (updated.length > 0) {
      const done = updated.filter((s) => s.completed).length;
      setProgress(Math.round((done / updated.length) * 100));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    let payload;
    // If files are selected, send as multipart FormData
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('startDate', startDate || '');
      formData.append('dueDate', dueDate || '');
      formData.append('progress', progress);
      formData.append('subtasks', JSON.stringify(subtasks));

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });
      payload = formData;
    } else {
      payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
        progress,
        subtasks,
      };
    }

    let result;
    if (editingTask) {
      const taskId = editingTask._id || editingTask.id;
      result = await updateTask(taskId, payload);
    } else {
      result = await createTask(payload);
    }

    setSubmitting(false);

    if (result.success) {
      toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
      closeNewTaskModal();
    } else {
      setFormError(result.error || 'Failed to save task');
    }
  };

  return (
    <div
      onClick={closeNewTaskModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1A1D27] w-full max-w-xl rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={closeNewTaskModal}
            className="text-content-muted hover:text-content-strong dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-primary border border-red-200 dark:border-red-900/50 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-content-strong dark:text-gray-200 mb-1.5">
              Task Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page"
              className="w-full h-11 px-3.5 bg-surface-light dark:bg-[#13151F] border border-border-light dark:border-border-dark rounded-xl text-content-strong dark:text-white placeholder:text-content-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Description */}
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

          {/* Subtasks / Checklist Section */}
          <div className="bg-[#FAF9F5] dark:bg-[#151822] p-4 rounded-xl border border-border-light dark:border-border-dark space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <label className="text-sm font-semibold text-content-strong dark:text-gray-200">
                  Subtasks / Checklist
                </label>
                {subtasks.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {subtasks.filter((s) => s.completed).length} / {subtasks.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-content-muted dark:text-gray-400">
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Existing Subtask Items */}
            {subtasks.length > 0 && (
              <div className="space-y-2 pt-1 max-h-40 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-[#1A1D27] border border-border-light dark:border-border-dark text-xs group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(idx)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left focus:outline-none"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                          st.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-[#13151F] hover:border-primary'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`truncate font-medium ${
                          st.completed
                            ? 'line-through text-content-muted dark:text-gray-500'
                            : 'text-content-strong dark:text-white'
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="opacity-0 group-hover:opacity-100 text-content-muted hover:text-red-600 p-1 rounded transition-opacity"
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input Form */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a checklist item (press Enter)..."
                className="flex-1 h-9 px-3 bg-white dark:bg-[#1A1D27] border border-border-light dark:border-border-dark rounded-lg text-content-strong dark:text-white placeholder:text-content-muted text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="h-9 px-3 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* File Attachments Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-content-strong dark:text-gray-200">
              Attachments{' '}
              <span className="text-xs text-content-muted dark:text-gray-400 font-normal">
                (Max 5 files, ≤ 5 MB each)
              </span>
            </label>

            {/* Existing Attachments (if editing) */}
            {existingAttachments.length > 0 && (
              <div className="space-y-1.5 mb-2">
                <span className="text-xs font-medium text-content-muted dark:text-gray-400">
                  Current files ({existingAttachments.length}):
                </span>
                <div className="space-y-1.5">
                  {existingAttachments.map((att) => {
                    const attId = att._id || att.id;
                    const isImg = isImageAttachment(att);
                    const fullUrl = getAttachmentUrl(att.url);

                    return (
                      <div
                        key={attId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border-light dark:border-border-dark text-xs gap-2"
                      >
                        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                          {isImg ? (
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border-light dark:border-border-dark hover:opacity-80 transition-opacity bg-black/5"
                              title="Click to preview image"
                            >
                              <img
                                src={fullUrl}
                                alt={att.filename}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50 dark:bg-red-950/40 text-primary border border-red-100 dark:border-red-900/30">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}

                          <div className="truncate min-w-0 flex-1">
                            <p className="truncate font-medium text-content-strong dark:text-white">
                              {att.filename}
                            </p>
                            <p className="text-content-muted text-[11px]">
                              {formatFileSize(att.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {att.url && (
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-soft dark:bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors font-medium text-[11px]"
                              title="Preview attachment"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          )}
                          {att.url && (
                            <a
                              href={fullUrl}
                              download={att.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-content-muted hover:text-content-strong dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingAttachment(attId)}
                            className="p-1.5 text-content-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary-soft/40 dark:bg-primary/10'
                  : 'border-border-light dark:border-border-dark hover:border-primary/50 bg-surface-light dark:bg-[#13151F]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />
              <UploadCloud className="w-8 h-8 text-primary/70 mx-auto mb-1.5" />
              <p className="text-xs sm:text-sm font-medium text-content-strong dark:text-gray-200">
                <span className="text-primary font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-content-muted dark:text-gray-400 mt-0.5">
                PDF, PNG, JPG, or WEBP (up to 5 MB each)
              </p>
            </div>

            {/* Selected New Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1 mt-2">
                <span className="text-xs font-medium text-content-muted dark:text-gray-400">
                  Ready to upload ({selectedFiles.length}):
                </span>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-primary-soft/30 dark:bg-primary/10 border border-primary/20 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate font-medium text-content-strong dark:text-white">
                        {file.name}
                      </span>
                      <span className="text-content-muted text-[11px]">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(idx)}
                      className="p-1 text-content-muted hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light dark:border-border-dark flex-shrink-0">
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
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-btn-red disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>

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
