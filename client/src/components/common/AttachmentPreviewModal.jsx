import { useEffect } from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { getAttachmentUrl, isImageAttachment, isPdfAttachment, formatFileSize } from '../../utils/attachmentUtils';

export default function AttachmentPreviewModal({ attachment, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!attachment) return null;

  const url = getAttachmentUrl(attachment.url);
  const isImg = isImageAttachment(attachment);
  const isPdf = isPdfAttachment(attachment);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1A1D27] rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-light dark:border-border-dark bg-gray-50/70 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {isImg ? (
              <ImageIcon className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="font-outfit font-semibold text-sm sm:text-base text-content-strong dark:text-white truncate">
                {attachment.filename}
              </h3>
              <p className="text-[11px] text-content-muted dark:text-gray-400">
                {formatFileSize(attachment.size)} • {attachment.mimeType || 'attachment'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Open Original in New Tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-content-strong dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in tab</span>
            </a>

            {/* Direct Download */}
            <a
              href={url}
              download={attachment.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-colors shadow-2xs"
              title="Download attachment"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#FAF9F5]/80 dark:bg-[#12141C] min-h-[300px]">
          {isImg ? (
            <img
              src={url}
              alt={attachment.filename}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
              loading="lazy"
            />
          ) : isPdf ? (
            <div className="w-full h-[70vh] flex flex-col">
              <iframe
                src={`${url}#toolbar=1`}
                title={attachment.filename}
                className="w-full h-full rounded-lg border border-border-light dark:border-border-dark bg-white"
              />
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <FileText className="w-16 h-16 text-content-muted/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-content-strong dark:text-white">
                Preview not directly supported in-line for this file type.
              </p>
              <p className="text-xs text-content-muted dark:text-gray-400 mt-1 mb-4">
                You can download the file or open it in a new browser tab.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-btn-red"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open File</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
