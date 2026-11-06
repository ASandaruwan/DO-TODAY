import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toISODateString } from '../utils/dateUtils';

const TaskContext = createContext(null);

const initialFilters = {
  q: '',
  status: '',
  priority: '',
  date: '',
  from: '',
  to: '',
};

// Normalizes tasks to ensure both _id and id are always present
const normalizeTask = (t) => {
  if (!t) return t;
  const id = t._id || t.id;
  const attachments = Array.isArray(t.attachments)
    ? t.attachments.map((a) => ({
        ...a,
        _id: a._id || a.id,
        id: a.id || a._id,
      }))
    : [];
  const subtasks = Array.isArray(t.subtasks)
    ? t.subtasks.map((s) => ({
        ...s,
        _id: s._id || s.id,
        id: s.id || s._id,
      }))
    : [];
  return {
    ...t,
    _id: id,
    id: id,
    attachments,
    subtasks,
    progress: typeof t.progress === 'number' ? t.progress : 0,
  };
};

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    pendingInProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state for Dashboard & views
  const [filters, setFilters] = useState(initialFilters);

  // Date selection for Home calendar & Today's tasks (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => toISODateString(new Date()));

  // Modal control
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalPrefilledDate, setModalPrefilledDate] = useState(null);

  const openNewTaskModal = (prefilledDate = null) => {
    setEditingTask(null);
    setModalPrefilledDate(prefilledDate || selectedDate);
    setIsNewTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setModalPrefilledDate(null);
    setIsNewTaskModalOpen(true);
  };

  const closeNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setEditingTask(null);
    setModalPrefilledDate(null);
  };

  // Fetch task statistics for Home page cards
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/tasks/stats');
      if (response.data) {
        setStats({
          active: response.data.active ?? 0,
          pendingInProgress: response.data.pendingInProgress ?? 0,
          completed: response.data.completed ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [isAuthenticated]);

  // Fetch all tasks matching current or specified filters
  const fetchTasks = useCallback(
    async (customFilters = null) => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);

      const activeParams = customFilters || filters;
      const params = {};

      if (activeParams.q) params.q = activeParams.q;
      if (activeParams.status) params.status = activeParams.status;
      if (activeParams.priority) params.priority = activeParams.priority;
      if (activeParams.from) params.from = activeParams.from;
      if (activeParams.to) params.to = activeParams.to;
      if (activeParams.date) params.date = activeParams.date;

      try {
        const response = await api.get('/tasks', { params });
        const taskList = Array.isArray(response.data)
          ? response.data
          : (response.data?.tasks || []);
        setTasks(taskList.map(normalizeTask));
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch tasks';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, filters]
  );

  // Auto-fetch stats and tasks when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchStats();
    } else {
      setTasks([]);
      setStats({ active: 0, pendingInProgress: 0, completed: 0 });
    }
  }, [isAuthenticated, fetchTasks, fetchStats]);

  // Derived stats as backup fallback in case server stats is 0 but tasks exist
  const effectiveStats = useMemo(() => {
    // If stats are populated from server, use them
    if (stats.active > 0 || stats.pendingInProgress > 0 || stats.completed > 0) {
      return stats;
    }
    // Otherwise compute from tasks array if available
    if (tasks && tasks.length > 0) {
      const active = tasks.filter((t) => t.status !== 'completed').length;
      const pendingInProgress = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length;
      const completed = tasks.filter((t) => t.status === 'completed').length;
      return { active, pendingInProgress, completed };
    }
    return stats;
  }, [stats, tasks]);

  // Create Task (supports JSON or FormData with attachments)
  const createTask = async (taskData) => {
    try {
      const config =
        taskData instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const response = await api.post('/tasks', taskData, config);
      const newTask = normalizeTask(response.data?.task || response.data);
      const nextTask = response.data?.nextTask ? normalizeTask(response.data.nextTask) : null;
      setTasks((prev) => {
        const list = [newTask, ...prev];
        if (nextTask && !list.some((t) => t._id === nextTask._id)) {
          return [nextTask, ...list];
        }
        return list;
      });
      fetchStats();
      return { success: true, task: newTask };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to create task';
      return { success: false, error: message };
    }
  };

  // Update Task
  const updateTask = async (id, taskData) => {
    const targetId = id || taskData?._id || taskData?.id;
    if (!targetId) {
      return { success: false, error: 'Task ID is missing' };
    }
    try {
      const config =
        taskData instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const response = await api.put(`/tasks/${targetId}`, taskData, config);
      const updatedTask = normalizeTask(response.data?.task || response.data);
      const nextTask = response.data?.nextTask ? normalizeTask(response.data.nextTask) : null;
      setTasks((prev) => {
        const updated = prev.map((t) => (t._id === targetId || t.id === targetId ? updatedTask : t));
        if (nextTask && !updated.some((t) => t._id === nextTask._id)) {
          return [nextTask, ...updated];
        }
        return updated;
      });
      fetchStats();
      return { success: true, task: updatedTask };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to update task';
      return { success: false, error: message };
    }
  };

  // Optimistic status update (used by Drag & Drop in Kanban & list toggle)
  const updateTaskStatus = async (id, newStatus, newOrder = 0) => {
    if (!id) {
      return { success: false, error: 'Task ID is missing' };
    }
    const previousTasks = [...tasks];

    // Optimistically update local state
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id || t.id === id ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    try {
      const response = await api.patch(`/tasks/${id}/status`, {
        status: newStatus,
        order: newOrder,
      });

      const updatedTask = normalizeTask(response.data?.task || response.data);
      const nextTask = response.data?.nextTask ? normalizeTask(response.data.nextTask) : null;
      setTasks((prev) => {
        const updated = prev.map((t) => (t._id === id || t.id === id ? updatedTask : t));
        if (nextTask && !updated.some((t) => t._id === nextTask._id)) {
          return [nextTask, ...updated];
        }
        return updated;
      });
      fetchStats();
      return { success: true, task: updatedTask };
    } catch (err) {
      // Rollback to previous state on failure
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to update task status';
      return { success: false, error: message };
    }
  };

  // Move Task (used by Kanban Drag & Drop with full optimistic reordering & rollback)
  const moveTask = async (taskId, sourceStatus, destStatus, sourceIndex, destIndex) => {
    if (!taskId) {
      return { success: false, error: 'Task ID is missing' };
    }
    const previousTasks = [...tasks];

    const sortByOrder = (a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    };

    // Optimistically update
    setTasks((currentTasks) => {
      const taskToMove = currentTasks.find((t) => t._id === taskId || t.id === taskId);
      if (!taskToMove) return currentTasks;

      const otherTasks = currentTasks.filter((t) => t._id !== taskId && t.id !== taskId);
      const destTasks = otherTasks.filter((t) => t.status === destStatus).sort(sortByOrder);
      const remainingTasks = otherTasks.filter((t) => t.status !== destStatus);

      const updatedTaskRecord = {
        ...taskToMove,
        status: destStatus,
        order: destIndex,
      };

      destTasks.splice(destIndex, 0, updatedTaskRecord);

      const reorderedDestTasks = destTasks.map((t, idx) => ({
        ...t,
        order: idx,
      }));

      return [...remainingTasks, ...reorderedDestTasks];
    });

    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: destStatus,
        order: destIndex,
      });

      const updatedTask = normalizeTask(response.data?.task || response.data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...updatedTask } : t))
      );
      fetchStats();
      return { success: true, task: updatedTask };
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to update task position';
      return { success: false, error: message };
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    if (!id) {
      return { success: false, error: 'Task ID is missing' };
    }
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id && t.id !== id));

    try {
      await api.delete(`/tasks/${id}`);
      fetchStats();
      return { success: true };
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to delete task';
      return { success: false, error: message };
    }
  };

  // Delete Attachment
  const deleteAttachment = async (taskId, attachmentId) => {
    if (!taskId || !attachmentId) {
      return { success: false, error: 'Task ID or Attachment ID is missing' };
    }
    try {
      const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      const updatedTask = normalizeTask(response.data?.task || response.data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? updatedTask : t))
      );
      return { success: true, task: updatedTask };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove attachment';
      return { success: false, error: message };
    }
  };

  // Toggle Subtask
  const toggleSubtask = async (taskId, subtaskId) => {
    if (!taskId || !subtaskId) return { success: false };
    const previousTasks = [...tasks];

    // Optimistically toggle subtask and recalculate progress
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === taskId || t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((s) =>
            s._id === subtaskId || s.id === subtaskId
              ? { ...s, completed: !s.completed }
              : s
          );
          const done = updatedSubtasks.filter((s) => s.completed).length;
          const newProgress = Math.round((done / updatedSubtasks.length) * 100);
          return {
            ...t,
            subtasks: updatedSubtasks,
            progress: newProgress,
          };
        }
        return t;
      })
    );

    try {
      const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      const updatedTask = normalizeTask(response.data?.task || response.data);
      const nextTask = response.data?.nextTask ? normalizeTask(response.data.nextTask) : null;
      setTasks((prev) => {
        const updated = prev.map((t) => (t._id === taskId || t.id === taskId ? updatedTask : t));
        if (nextTask && !updated.some((t) => t._id === nextTask._id)) {
          return [nextTask, ...updated];
        }
        return updated;
      });
      fetchStats();
      return { success: true, task: updatedTask };
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to toggle subtask';
      return { success: false, error: message };
    }
  };

  // Bulk update status for multiple tasks
  const bulkUpdateStatus = async (taskIds, status) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return { success: false };
    const previousTasks = [...tasks];

    // Optimistically update
    setTasks((prev) =>
      prev.map((t) => {
        const id = t._id || t.id;
        if (taskIds.includes(id)) {
          return {
            ...t,
            status,
            progress: status === 'completed' ? 100 : status === 'pending' ? 0 : t.progress,
          };
        }
        return t;
      })
    );

    try {
      const response = await api.patch('/tasks/bulk/status', { taskIds, status });
      fetchStats();
      return { success: true, count: response.data?.modifiedCount };
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to update selected tasks';
      return { success: false, error: message };
    }
  };

  // Bulk delete multiple tasks
  const bulkDeleteTasks = async (taskIds) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return { success: false };
    const previousTasks = [...tasks];

    // Optimistically delete
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t._id || t.id)));

    try {
      const response = await api.delete('/tasks/bulk', { data: { taskIds } });
      fetchStats();
      return { success: true, count: response.data?.deletedCount };
    } catch (err) {
      setTasks(previousTasks);
      const message = err.response?.data?.message || 'Failed to delete selected tasks';
      return { success: false, error: message };
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const value = {
    tasks,
    stats: effectiveStats,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    selectedDate,
    setSelectedDate,
    isNewTaskModalOpen,
    editingTask,
    modalPrefilledDate,
    openNewTaskModal,
    openEditTaskModal,
    closeNewTaskModal,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    updateTaskStatus,
    moveTask,
    deleteTask,
    deleteAttachment,
    toggleSubtask,
    bulkUpdateStatus,
    bulkDeleteTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
