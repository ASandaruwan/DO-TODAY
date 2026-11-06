import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTasks } from './TaskContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

const STORAGE_KEY_SETTINGS = 'do_today_notification_settings';
const STORAGE_KEY_DISMISSED = 'do_today_dismissed_notifications';

const DEFAULT_SETTINGS = {
  browserNotificationsEnabled: true,
  remindOverdue: true,
  remindDueToday: true,
  remindDueSoon: true, // within next 48 hours
};

export const NotificationProvider = ({ children }) => {
  const { tasks } = useTasks();
  const { toast } = useToast();

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Set of dismissed notification IDs
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISMISSED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track task IDs that already triggered a browser notification during the current session
  const browserNotifiedRef = useRef(new Set());

  // Browser Notification API permission state
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Update permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save notification settings:', err);
      }
      return updated;
    });
  }, []);

  // Request browser notification permission
  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Browser push notifications are not supported in your browser.');
      return 'unsupported';
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        toast.success('Browser notifications enabled successfully!');
      } else if (perm === 'denied') {
        toast.error('Notification permission was blocked. You can enable it in your browser settings.');
      }
      return perm;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }, [toast]);

  // Dispatch browser push notification
  const sendBrowserNotification = useCallback((title, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted' || !settings.browserNotificationsEnabled) return;

    try {
      const n = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (err) {
      console.error('Browser notification error:', err);
    }
  }, [settings.browserNotificationsEnabled]);

  // Compute active approaching deadline notifications from tasks
  const notifications = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
    const soonThreshold = todayEnd + 48 * 60 * 60 * 1000; // Next 48 hours

    const items = [];

    tasks.forEach((task) => {
      if (!task || task.status === 'completed' || !task.dueDate) return;

      const due = new Date(task.dueDate).getTime();
      if (isNaN(due)) return;

      const taskId = task._id || task.id;

      if (due < todayStart && settings.remindOverdue) {
        // Overdue
        const notifId = `${taskId}-overdue`;
        if (!dismissedIds.includes(notifId)) {
          items.push({
            id: notifId,
            taskId,
            task,
            type: 'overdue',
            title: task.title,
            dueDate: task.dueDate,
            message: 'This task is past its due date.',
            priority: task.priority || 'medium',
          });
        }
      } else if (due >= todayStart && due <= todayEnd && settings.remindDueToday) {
        // Due Today
        const notifId = `${taskId}-today`;
        if (!dismissedIds.includes(notifId)) {
          items.push({
            id: notifId,
            taskId,
            task,
            type: 'due-today',
            title: task.title,
            dueDate: task.dueDate,
            message: 'Due today! Finish it before the day ends.',
            priority: task.priority || 'medium',
          });
        }
      } else if (due > todayEnd && due <= soonThreshold && settings.remindDueSoon) {
        // Due Soon (next 48h)
        const notifId = `${taskId}-soon`;
        if (!dismissedIds.includes(notifId)) {
          items.push({
            id: notifId,
            taskId,
            task,
            type: 'due-soon',
            title: task.title,
            dueDate: task.dueDate,
            message: 'Deadline approaching within 48 hours.',
            priority: task.priority || 'medium',
          });
        }
      }
    });

    // Sort order: overdue first, then due today, then due soon
    const typeOrder = { overdue: 1, 'due-today': 2, 'due-soon': 3 };
    return items.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
  }, [tasks, settings, dismissedIds]);

  // Trigger native browser notification for new urgent items
  useEffect(() => {
    if (browserPermission !== 'granted' || !settings.browserNotificationsEnabled) return;

    notifications.forEach((item) => {
      // Only push overdue or due-today once per session
      if ((item.type === 'overdue' || item.type === 'due-today') && !browserNotifiedRef.current.has(item.id)) {
        browserNotifiedRef.current.add(item.id);
        const prefix = item.type === 'overdue' ? '⚠️ Overdue Task: ' : '⏰ Due Today: ';
        sendBrowserNotification(`${prefix}${item.title}`, {
          body: item.message,
          tag: item.id,
        });
      }
    });
  }, [notifications, browserPermission, settings.browserNotificationsEnabled, sendBrowserNotification]);

  // Dismiss a notification
  const dismissNotification = useCallback((id) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save dismissed notification:', err);
      }
      return updated;
    });
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to save dismissed notifications:', err);
      }
      return merged;
    });
  }, [notifications]);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (browserPermission !== 'granted') {
      const perm = await requestBrowserPermission();
      if (perm !== 'granted') return;
    }

    sendBrowserNotification('🔔 DO-TODAY Notification Test', {
      body: 'Browser push notifications are active and ready for deadline reminders!',
    });
    toast.success('Test notification sent!');
  }, [browserPermission, requestBrowserPermission, sendBrowserNotification, toast]);

  const value = {
    notifications,
    unreadCount: notifications.length,
    settings,
    updateSettings,
    browserPermission,
    requestBrowserPermission,
    sendBrowserNotification,
    sendTestNotification,
    dismissNotification,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
