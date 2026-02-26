import { useEffect, useState } from 'preact/hooks';
import { baseUrl } from '../constants';

interface Log {
  requestId?: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  endpoint?: string;
  durationMs?: number;
  status?: 'success' | 'error';
  errorMessage?: string;
  errorCode?: string;
  openaiRequestId?: string;
  userAgent?: string;
  data: {
    prompt: string;
    model: string;
  };
}

const PAGE_SIZE = 20;

function formatTimestamp(ts: string): string {
  if (!ts) return 'N/A';
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function StatusBadge({ status }: { status?: 'success' | 'error' }) {
  if (!status) return <span class="text-gray-400 text-xs">—</span>;
  if (status === 'success') {
    return (
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ success
      </span>
    );
  }
  return (
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      ✗ error
    </span>
  );
}

function LogRow({ log, onClick }: { log: Log; onClick: () => void }) {
  return (
    <tr
      class="hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-100"
      onClick={onClick}
    >
      <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
        {formatTimestamp(log.timestamp)}
      </td>
      <td class="px-4 py-3">
        <StatusBadge status={log.status} />
      </td>
      <td class="px-4 py-3 text-xs text-gray-700 font-mono truncate max-w-[180px]">
        {log.endpoint || '—'}
      </td>
      <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
        {log.data?.model || '—'}
      </td>
      <td class="px-4 py-3 text-xs text-gray-600 max-w-[300px]">
        <span class="block truncate" title={log.data?.prompt}>
          {log.data?.prompt || '—'}
        </span>
      </td>
      <td class="px-4 py-3 text-xs text-gray-500">
        {log.ipAddress || '—'}
      </td>
      <td class="px-4 py-3 text-xs text-gray-500">
        {log.location || '—'}
      </td>
      <td class="px-4 py-3 text-xs text-right text-gray-500 whitespace-nowrap">
        {log.durationMs != null ? `${log.durationMs} ms` : '—'}
      </td>
    </tr>
  );
}

function LogDetailModal({ log, onClose }: { log: Log; onClose: () => void }) {
  return (
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">Log Detail</h2>
          <button
            onClick={onClose}
            class="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div class="p-5 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <Field label="Timestamp" value={formatTimestamp(log.timestamp)} />
            <Field label="Status">
              <StatusBadge status={log.status} />
            </Field>
            <Field label="Endpoint" value={log.endpoint} mono />
            <Field label="Model" value={log.data?.model} />
            <Field label="IP Address" value={log.ipAddress} mono />
            <Field label="Location" value={log.location} />
            <Field label="Duration" value={log.durationMs != null ? `${log.durationMs} ms` : undefined} />
            <Field label="Request ID" value={log.requestId} mono />
            <Field label="OpenAI Request ID" value={log.openaiRequestId} mono />
          </div>

          {log.data?.prompt && (
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prompt</p>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700 text-sm whitespace-pre-wrap">
                {log.data.prompt}
              </div>
            </div>
          )}

          {log.errorMessage && (
            <div>
              <p class="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Error</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm font-mono">
                {log.errorCode && <span class="font-bold">[{log.errorCode}] </span>}
                {log.errorMessage}
              </div>
            </div>
          )}

          {log.userAgent && (
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">User Agent</p>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 text-xs font-mono break-all">
                {log.userAgent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
  children?: any;
}) {
  return (
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      {children ?? (
        <p class={`text-gray-700 truncate ${mono ? 'font-mono text-xs' : ''}`}>
          {value ?? <span class="text-gray-300">—</span>}
        </p>
      )}
    </div>
  );
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = pageNum * PAGE_SIZE;
      const res = await fetch(`${baseUrl}/internal/logs?offset=${offset}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Log[] = await res.json();
      setLogs(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setError(`Failed to load logs: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const goToPrev = () => setPage((p) => Math.max(0, p - 1));
  const goToNext = () => setPage((p) => p + 1);

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl">📋</span>
          Request Logs
        </h1>
        <p class="text-gray-500 mt-1">
          Most recent API activity — {PAGE_SIZE} per page
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <p class="text-red-600">{error}</p>
          <button
            onClick={() => fetchLogs(page)}
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Timestamp
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Endpoint
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Model
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Prompt
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  IP
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Location
                </th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} class="border-b border-gray-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} class="px-4 py-3">
                        <div class="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colspan={8} class="px-4 py-12 text-center text-gray-400">
                    No logs found for this page.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <LogRow key={i} log={log} onClick={() => setSelectedLog(log)} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p class="text-xs text-gray-500">
            Page {page + 1}
            {!loading && logs.length > 0 && (
              <span> · {logs.length} log{logs.length !== 1 ? 's' : ''}</span>
            )}
          </p>
          <div class="flex items-center gap-2">
            <button
              onClick={goToPrev}
              disabled={page === 0 || loading}
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span class="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg">
              {page + 1}
            </span>
            <button
              onClick={goToNext}
              disabled={!hasMore || loading}
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
