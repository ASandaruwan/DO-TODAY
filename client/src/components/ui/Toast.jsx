import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => {
      onClose?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-red-600 text-white shadow-red-500/20',
    info: 'bg-content-strong dark:bg-gray-800 text-white shadow-black/20',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-sm max-w-md">
      <div className={`flex items-center gap-2.5 ${styles[type] || styles.info} px-3.5 py-2.5 rounded-lg w-full`}>
        {icons[type] || icons.info}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/20 transition-colors ml-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
