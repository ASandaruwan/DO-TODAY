import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => {
      onClose?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

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

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-250 pointer-events-auto"
    >
      <div className={`flex items-center gap-3 flex-1 min-w-0 ${config.cardClass}`}>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium leading-snug break-words flex-1">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 rounded-lg text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
