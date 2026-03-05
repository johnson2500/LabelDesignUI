import { useEffect, useState, useCallback } from 'preact/hooks';
import { getSignedUrl } from '../../services/googleProjects.service';
import { formatBytes, isImage, isPdf, fileIcon } from '../../utils/format';
import type { ProjectFile } from '../../types/project.types';

function PdfViewerModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div class="relative w-[90vw] h-[90vh] max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xl">📄</span>
            <p class="text-sm font-semibold text-gray-800 truncate">{name}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              class="px-3 py-1.5 text-xs font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Open in new tab ↗
            </a>
            <button
              onClick={onClose}
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="flex-1 bg-gray-100">
          <iframe
            src={url}
            class="w-full h-full border-0"
            title={name}
          />
        </div>
      </div>
    </div>
  );
}

export function FilePreview({ file }: { file: ProjectFile }) {
  const [url, setUrl] = useState<string | null>(file.downloadUrl || null);
  const [loading, setLoading] = useState(!file.downloadUrl);
  const [failed, setFailed] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const image = isImage(file.type);
  const pdf = isPdf(file.type);

  useEffect(() => {
    if (url) return;

    const path = file.storagePath;
    if (!path || path.startsWith('blob:')) {
      setLoading(false);
      setFailed(!url);
      return;
    }
    getSignedUrl(path).then((u) => {
      if (u) setUrl(u);
      else setFailed(true);
      setLoading(false);
    });
  }, [file.storagePath, url]);

  const closePdf = useCallback(() => setPdfOpen(false), []);

  return (
    <>
      <div class="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        {image ? (
          <div class="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
            {loading && (
              <div class="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400 text-xs">Loading…</span>
              </div>
            )}
            {!loading && failed && <span class="text-gray-400 text-xs">Failed to load</span>}
            {!loading && url && (
              <img
                src={url}
                alt={file.name}
                class="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => window.open(url, '_blank')}
              />
            )}
          </div>
        ) : (
          <div
            class={`w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2 ${
              pdf && url && !loading && !failed ? 'cursor-pointer hover:from-orange-50 hover:to-amber-50 transition-colors' : ''
            }`}
            onClick={() => { if (pdf && url && !loading && !failed) setPdfOpen(true); }}
          >
            <span class="text-4xl">{fileIcon(file.type)}</span>
            {loading && <span class="text-xs text-gray-400">Loading…</span>}
            {!loading && failed && <span class="text-xs text-red-400">Unavailable</span>}
            {!loading && url && pdf && (
              <span class="text-xs font-medium text-orange-600 px-3 py-1 bg-white rounded-full border border-orange-200 shadow-sm">
                View PDF
              </span>
            )}
            {!loading && url && !pdf && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs font-medium text-orange-600 hover:underline px-3 py-1 bg-white rounded-full border border-orange-200 shadow-sm"
              >
                Open file ↗
              </a>
            )}
          </div>
        )}

        <div class="px-3 py-2 border-t border-gray-100 bg-white">
          <p class="text-xs font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
          <div class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-gray-400">{file.size != null ? formatBytes(file.size) : '—'}</span>
            <span
              class={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                file.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {file.status}
            </span>
          </div>
        </div>
      </div>

      {pdfOpen && url && <PdfViewerModal url={url} name={file.name} onClose={closePdf} />}
    </>
  );
}
