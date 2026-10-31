import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show a new toast
  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // Convenience methods
  const toast = useMemo(
    () => ({
      success: (msg, duration) => showToast(msg, 'success', duration),
      error: (msg, duration) => showToast(msg, 'error', duration),
      warning: (msg, duration) => showToast(msg, 'warning', duration),
      info: (msg, duration) => showToast(msg, 'info', duration),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Global Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function ToastItem({ toast, onDismiss }) {
  const typeConfig = {
    success: {
      cardClass:
        'bg-white dark:bg-[#1A1D27] border-emerald-500/30 text-content-strong dark:text-white shadow-emerald-500/10',
      iconClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      icon: CheckCircle2,
    },
    error: {
      cardClass:
        'bg-white dark:bg-[#1A1D27] border-red-500/30 text-content-strong dark:text-white shadow-red-500/10',
      iconClass: 'text-primary bg-primary-soft/50 dark:bg-primary/20',
      icon: AlertCircle,
    },
    warning: {
      cardClass:
        'bg-white dark:bg-[#1A1D27] border-amber-500/30 text-content-strong dark:text-white shadow-amber-500/10',
      iconClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
      icon: AlertTriangle,
    },
    info: {
      cardClass:
        'bg-white dark:bg-[#1A1D27] border-blue-500/30 text-content-strong dark:text-white shadow-blue-500/10',
      iconClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
      icon: Info,
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-250 ${config.cardClass}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium leading-snug break-words flex-1">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="p-1 rounded-lg text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;

