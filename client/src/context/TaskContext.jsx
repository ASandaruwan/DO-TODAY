import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toISODateString } from '../utils/dateUtils';

const TaskContext = createContext(null);

const initialFilters = {
  q: '',
  status: '',
  priority: '',
  from: '',
  to: '',
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
        setTasks(taskList);
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
      const newTask = response.data?.task || response.data;
      setTasks((prev) => [newTask, ...prev]);
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
    try {
      const config =
        taskData instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const response = await api.put(`/tasks/${id}`, taskData, config);
      const updatedTask = response.data?.task || response.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
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
    const previousTasks = [...tasks];

    // Optimistically update local state
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    try {
      const response = await api.patch(`/tasks/${id}/status`, {
        status: newStatus,
        order: newOrder,
      });

      const updatedTask = response.data?.task || response.data;
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updatedTask : t))
      );
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
    const previousTasks = [...tasks];

    // Optimistically update
    setTasks((currentTasks) => {
      const taskToMove = currentTasks.find((t) => t._id === taskId);
      if (!taskToMove) return currentTasks;

      const otherTasks = currentTasks.filter((t) => t._id !== taskId);
      const destTasks = otherTasks.filter((t) => t.status === destStatus);
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

      const updatedTask = response.data?.task || response.data;
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...updatedTask } : t))
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
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));

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
    try {
      const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      const updatedTask = response.data?.task || response.data;
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updatedTask : t))
      );
      return { success: true, task: updatedTask };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove attachment';
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
