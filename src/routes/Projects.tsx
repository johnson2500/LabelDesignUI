import { useEffect, useState } from 'preact/hooks';
import { baseUrl } from '../constants';

// ── Types ──────────────────────────────────────────────────────────────────

interface UploadedFile {
  fileId: string;
  name: string;
  fileType: string;
  status: string;
  size: number;
  type: string;
  storagePath: string;
  error?: string;
}

interface ProjectDesign {
  bundleId?: string;
  designDescription?: string;
  shape?: { displayName: string; id: string };
  size?: { displayName: string; id: string; isCustom: boolean };
  uploadedFiles?: UploadedFile[];
  designType?: { title: string; handle: string };
  fileTypes?: { preSelectedFileTypes: string[]; additionalFileTypes: string[] };
}

interface ProjectSummary {
  projectName?: string;
  packageName?: string;
  turnaroundName?: string;
  dueDate?: string;
}

interface ProjectFormData {
  design?: ProjectDesign;
  summary?: ProjectSummary;
  projectType?: { id: string; name: string };
  selection?: { title: string; selectionType: string };
}

interface Project {
  id: string;
  bundleId?: string;
  cartId?: string;
  createdAt?: string;
  updatedAt?: string;
  currentStep?: string;
  formData?: ProjectFormData;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const STEP_LABELS: Record<string, { label: string; color: string }> = {
  summary: { label: 'Summary', color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Design', color: 'bg-purple-100 text-purple-800' },
  edit: { label: 'Edit', color: 'bg-amber-100 text-amber-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' },
};

// ── Signed URL cache ───────────────────────────────────────────────────────

const urlCache = new Map<string, string>();

async function getSignedUrl(storagePath: string): Promise<string | null> {
  if (urlCache.has(storagePath)) return urlCache.get(storagePath)!;
  try {
    const res = await fetch(
      `${baseUrl}/v1/api/image-generator/google-signed-url?path=${encodeURIComponent(storagePath)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.url) {
      urlCache.set(storagePath, data.url);
      return data.url;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function formatDate(iso?: string | null): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('postscript') || mimeType.includes('eps')) return '🎨';
  if (mimeType.includes('photoshop') || mimeType.includes('psd')) return '🎨';
  return '📎';
}

function StepBadge({ step }: { step?: string }) {
  if (!step) return <span class="text-gray-400 text-xs">—</span>;
  const cfg = STEP_LABELS[step] ?? { label: step, color: 'bg-gray-100 text-gray-700' };
  return (
    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── File Preview ───────────────────────────────────────────────────────────

function FilePreview({ file }: { file: UploadedFile }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const image = isImage(file.type);

  useEffect(() => {
    if (!file.storagePath) {
      setLoading(false);
      return;
    }
    getSignedUrl(file.storagePath).then((u) => {
      if (u) setUrl(u);
      else setFailed(true);
      setLoading(false);
    });
  }, [file.storagePath]);

  return (
    <div class="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      {/* Image preview */}
      {image && (
        <div class="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {loading && (
            <div class="w-full h-full animate-pulse bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400 text-xs">Loading…</span>
            </div>
          )}
          {!loading && failed && (
            <span class="text-gray-400 text-xs">Failed to load</span>
          )}
          {!loading && url && (
            <img
              src={url}
              alt={file.name}
              class="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => window.open(url, '_blank')}
            />
          )}
        </div>
      )}

      {/* Non-image placeholder */}
      {!image && (
        <div class="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2">
          <span class="text-4xl">{fileIcon(file.type)}</span>
          {loading && <span class="text-xs text-gray-400">Loading…</span>}
          {!loading && failed && <span class="text-xs text-red-400">Unavailable</span>}
          {!loading && url && (
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

      {/* File info footer */}
      <div class="px-3 py-2 border-t border-gray-100 bg-white">
        <p class="text-xs font-medium text-gray-700 truncate" title={file.name}>{file.name}</p>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs text-gray-400">{formatBytes(file.size)}</span>
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
  );
}

// ── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const summary = project.formData?.summary;
  const design = project.formData?.design;
  const files = design?.uploadedFiles ?? [];
  const projectType = project.formData?.projectType;
  const selection = project.formData?.selection;

  return (
    <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-5">
      {/* Header */}
      <div class="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-4">
        <div class="flex flex-wrap justify-between items-start gap-2">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              {summary?.projectName ?? project.bundleId ?? project.id}
            </h3>
            <p class="text-xs text-gray-400 font-mono mt-0.5">{project.bundleId}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <StepBadge step={project.currentStep} />
            <p class="text-xs text-gray-400">{formatDate(project.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Core details grid */}
      <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Detail label="Package" value={summary?.packageName} />
        <Detail label="Turnaround" value={summary?.turnaroundName} />
        <Detail label="Due Date" value={formatDate(summary?.dueDate)} />
        <Detail label="Design Type" value={design?.designType?.title} />
        <Detail label="Project Type" value={projectType?.name} />
        <Detail label="Selection" value={selection?.title} />
        <Detail label="Shape" value={design?.shape?.displayName} />
        <Detail label="Size" value={design?.size?.displayName} />
        {design?.designDescription && (
          <div class="col-span-2 sm:col-span-3 md:col-span-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
            <p class="text-sm text-gray-700">{design.designDescription}</p>
          </div>
        )}
      </div>

      {/* Uploaded files — previews */}
      {files.length > 0 && (
        <div class="border-t border-gray-100 px-4 pb-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 mb-3">
            Files ({files.length})
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f, i) => (
              <FilePreview key={i} file={f} />
            ))}
          </div>
        </div>
      )}

      {/* Expandable raw details */}
      <div class="border-t border-gray-100">
        <button
          onClick={() => setExpanded((v) => !v)}
          class="w-full px-4 py-2.5 text-left text-xs text-orange-600 hover:bg-orange-50 font-medium transition-colors flex items-center gap-1"
        >
          <span>{expanded ? '▾' : '▸'}</span>
          {expanded ? 'Hide details' : 'Show raw details'}
        </button>
        {expanded && (
          <div class="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Detail label="Bundle ID" value={project.bundleId} mono />
            <Detail label="Cart ID" value={project.cartId} mono />
            <Detail label="Last Updated" value={formatDate(project.updatedAt)} />
            {design?.fileTypes?.preSelectedFileTypes?.length ? (
              <Detail label="Accepted File Types" value={design.fileTypes.preSelectedFileTypes.join(', ')} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p class={`text-sm text-gray-700 truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? <span class="text-gray-300">—</span>}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProjects = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = pageNum * PAGE_SIZE;
      const res = await fetch(`${baseUrl}/internal/projects?offset=${offset}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Project[] = await res.json();
      setProjects(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setError(`Failed to load projects: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  return (
    <div class="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl">🗂️</span>
          Customer Projects
        </h1>
        <p class="text-gray-500 mt-1">Newest to oldest · {PAGE_SIZE} per page</p>
      </div>

      {/* Error */}
      {error && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
          <p class="text-red-600">{error}</p>
          <button
            onClick={() => fetchProjects(page)}
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div class="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div class="flex justify-between mb-4">
                <div class="h-5 bg-gray-100 rounded w-48" />
                <div class="h-5 bg-gray-100 rounded w-24" />
              </div>
              <div class="grid grid-cols-4 gap-4 mb-4">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} class="h-4 bg-gray-100 rounded" />
                ))}
              </div>
              <div class="grid grid-cols-4 gap-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} class="aspect-square bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p class="text-gray-500">No projects found.</p>
        </div>
      )}

      {/* Projects */}
      {!loading && projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}

      {/* Pagination */}
      {!loading && !error && (projects.length > 0 || page > 0) && (
        <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p class="text-xs text-gray-500">
            Page {page + 1}
            {projects.length > 0 && (
              <span> · {projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            )}
          </p>
          <div class="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span class="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg">
              {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
