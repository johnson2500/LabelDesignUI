import { useEffect, useState, useRef } from 'preact/hooks';
import {
  fetchCustomerProjects,
  PAGE_SIZE,
  type CustomerProject,
  type UploadedFile,
} from '../services/projects.service';
import {
  fetchGoogleProjects,
  getSignedUrl,
  type GoogleProjectFolder,
  type StorageFile,
  type TextFile,
} from '../services/googleProjects.service';

// ── Shared helpers ──────────────────────────────────────────────────────────

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

// ── Customer Projects ───────────────────────────────────────────────────────

const STEP_LABELS: Record<string, { label: string; color: string }> = {
  summary: { label: 'Summary', color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Design', color: 'bg-purple-100 text-purple-800' },
  edit: { label: 'Edit', color: 'bg-amber-100 text-amber-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' },
};

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
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

function CustomerFilePreview({ file }: { file: UploadedFile }) {
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
      {image && (
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
      )}

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

function CustomerProjectCard({ project }: { project: CustomerProject }) {
  const [expanded, setExpanded] = useState(false);

  const summary = project.formData?.summary;
  const design = project.formData?.design;
  const files = design?.uploadedFiles ?? [];
  const projectType = project.formData?.projectType;
  const selection = project.formData?.selection;

  return (
    <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-5">
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

      {files.length > 0 && (
        <div class="border-t border-gray-100 px-4 pb-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 mb-3">
            Files ({files.length})
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f, i) => (
              <CustomerFilePreview key={i} file={f} />
            ))}
          </div>
        </div>
      )}

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

// ── Google Storage Projects ─────────────────────────────────────────────────

function LazyStorageImage({ file, className }: { file: StorageFile; className?: string }) {
  const [url, setUrl] = useState<string | null>(file.downloadUrl || null);
  const [loading, setLoading] = useState(!file.downloadUrl);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (url) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          getSignedUrl(file.path).then((signedUrl) => {
            if (signedUrl) setUrl(signedUrl);
            else setError(true);
            setLoading(false);
          });
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [file.path, url]);

  if (error) {
    return (
      <div class={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span class="text-gray-400 text-xs">Failed</span>
      </div>
    );
  }

  if (loading || !url) {
    return (
      <div ref={imgRef} class={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
        <span class="text-gray-400 text-xs">Loading...</span>
      </div>
    );
  }

  return <img src={url} alt={file.name} class={className} loading="lazy" />;
}

function GoogleProjectCard({ project }: { project: GoogleProjectFolder }) {
  const [expanded, setExpanded] = useState(false);
  const hasTextFiles = project.textFiles && project.textFiles.length > 0;

  return (
    <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      <div class="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 p-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span class="text-sky-500">📁</span>
              {project.folderName}
            </h3>
            <p class="text-xs text-gray-500 mt-1 font-mono">{project.path}</p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
              {project.images.length} image{project.images.length !== 1 ? 's' : ''}
            </span>
            {project.created && (
              <p class="text-xs text-gray-500 mt-1">{formatDate(project.created)}</p>
            )}
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {project.images.slice(0, expanded ? undefined : 4).map((image, idx) => (
            <div
              key={idx}
              class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-sky-300 transition-all hover:shadow-lg cursor-pointer"
              onClick={async () => {
                const url = image.downloadUrl || await getSignedUrl(image.path);
                if (url) window.open(url, '_blank');
              }}
            >
              <LazyStorageImage
                file={image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="absolute bottom-0 left-0 right-0 p-2">
                  <p class="text-white text-xs font-medium truncate">{image.name}</p>
                  <p class="text-white/70 text-xs">{formatBytes(image.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {project.images.length > 4 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            class="mt-3 w-full py-2 text-sm text-sky-600 hover:text-sky-700 font-medium hover:bg-sky-50 rounded-lg transition-colors"
          >
            Show all {project.images.length} images
          </button>
        )}
      </div>

      {hasTextFiles && (
        <div class="border-t border-gray-100 p-4 bg-gray-50">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-amber-500">📝</span>
            <span class="text-sm font-medium text-gray-700">
              {project.textFiles.length === 1 ? 'Prompt' : `Text Files (${project.textFiles.length})`}
            </span>
          </div>
          <div class="space-y-3">
            {project.textFiles.map((textFile: TextFile, idx: number) => (
              <div key={idx} class="bg-white p-3 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1 font-mono">{textFile.name}</p>
                {textFile.content ? (
                  <p class="text-sm text-gray-600 whitespace-pre-wrap">{textFile.content}</p>
                ) : textFile.url ? (
                  <a
                    href={textFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-sky-600 hover:underline"
                  >
                    Download file
                  </a>
                ) : (
                  <p class="text-sm text-gray-400 italic">Content not available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Combined Page ───────────────────────────────────────────────────────────

type Tab = 'customers' | 'google';

export default function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('customers');

  // Customer projects state
  const [customerProjects, setCustomerProjects] = useState<CustomerProject[]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Google Storage state
  const [googleProjects, setGoogleProjects] = useState<GoogleProjectFolder[]>([]);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const loadCustomerProjects = async (page: number) => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const data = await fetchCustomerProjects(page);
      setCustomerProjects(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setCustomerError(`Failed to load projects: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setCustomerLoading(false);
    }
  };

  const loadGoogleProjects = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const data = await fetchGoogleProjects();
      setGoogleProjects(data);
    } catch (err: any) {
      setGoogleError(`Failed to load projects: ${err?.message || 'Unknown error'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Load both datasets in parallel on mount
  useEffect(() => {
    loadCustomerProjects(0);
    loadGoogleProjects();
  }, []);

  useEffect(() => {
    loadCustomerProjects(customerPage);
  }, [customerPage]);

  const totalImages = googleProjects.reduce((acc, p) => acc + p.images.length, 0);

  return (
    <div class="max-w-5xl mx-auto px-4 py-6">
      {/* Page header */}
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl">🗂️</span>
          Projects
        </h1>
        <p class="text-gray-500 mt-1">Customer projects and Google Storage files in one place</p>
      </div>

      {/* Tabs */}
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('customers')}
          class={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🗂️ Customer Projects
          {!customerLoading && (
            <span class={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'customers' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {customerProjects.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('google')}
          class={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'google'
              ? 'border-sky-500 text-sky-600 bg-sky-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          ☁️ Google Storage
          {!googleLoading && (
            <span class={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'google' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {googleProjects.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Customer Projects Tab ── */}
      {activeTab === 'customers' && (
        <div>
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-500">Sorted by due date · soonest first · {PAGE_SIZE} per page</p>
          </div>

          {customerError && (
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
              <p class="text-red-600">{customerError}</p>
              <button
                onClick={() => loadCustomerProjects(customerPage)}
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {customerLoading && (
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

          {!customerLoading && !customerError && customerProjects.length === 0 && (
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p class="text-gray-500">No projects found.</p>
            </div>
          )}

          {!customerLoading && customerProjects.map((p) => (
            <CustomerProjectCard key={p.id} project={p} />
          ))}

          {!customerLoading && !customerError && (customerProjects.length > 0 || customerPage > 0) && (
            <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p class="text-xs text-gray-500">
                Page {customerPage + 1}
                {customerProjects.length > 0 && (
                  <span> · {customerProjects.length} project{customerProjects.length !== 1 ? 's' : ''}</span>
                )}
              </p>
              <div class="flex items-center gap-2">
                <button
                  onClick={() => setCustomerPage((p) => Math.max(0, p - 1))}
                  disabled={customerPage === 0}
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span class="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg">
                  {customerPage + 1}
                </span>
                <button
                  onClick={() => setCustomerPage((p) => p + 1)}
                  disabled={!hasMore}
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Google Storage Tab ── */}
      {activeTab === 'google' && (
        <div>
          {/* Stats row */}
          {!googleLoading && !googleError && googleProjects.length > 0 && (
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100">
                <p class="text-3xl font-bold text-sky-600">{googleProjects.length}</p>
                <p class="text-sm text-gray-600">Total Folders</p>
              </div>
              <div class="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                <p class="text-3xl font-bold text-indigo-600">{totalImages}</p>
                <p class="text-sm text-gray-600">Total Images</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <p class="text-3xl font-bold text-green-600">
                  {googleProjects.filter((p) => p.textFiles && p.textFiles.length > 0).length}
                </p>
                <p class="text-sm text-gray-600">With Text Files</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                <p class="text-3xl font-bold text-purple-600">
                  {googleProjects.length > 0
                    ? Math.round(totalImages / googleProjects.length)
                    : 0}
                </p>
                <p class="text-sm text-gray-600">Avg Images/Folder</p>
              </div>
            </div>
          )}

          {googleLoading && (
            <div class="flex flex-col items-center justify-center py-16">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
              <p class="mt-4 text-gray-500">Loading from Google Storage…</p>
            </div>
          )}

          {googleError && (
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p class="text-red-600">{googleError}</p>
              <button
                onClick={loadGoogleProjects}
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!googleLoading && !googleError && googleProjects.length === 0 && (
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p class="text-gray-500">No projects found in Google Storage.</p>
            </div>
          )}

          {!googleLoading && !googleError && googleProjects.map((project, idx) => (
            <GoogleProjectCard key={idx} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
