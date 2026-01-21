import { useEffect, useState, useRef } from 'preact/hooks';
import { baseUrl } from '../constants';

interface StorageFile {
  name: string;
  path: string;
  size: number;
  created: string | null;
  contentType: string;
  downloadUrl?: string;
}

interface TextFile {
  name: string;
  path: string;
  url?: string;
  content?: string;
}

interface ProjectFolder {
  path: string;
  folderName: string;
  images: StorageFile[];
  textFiles: TextFile[];
  created: string | null;
}

// Cache for signed URLs
const urlCache = new Map<string, string>();

async function getSignedUrl(path: string): Promise<string | null> {
  if (urlCache.has(path)) {
    return urlCache.get(path)!;
  }
  try {
    const res = await fetch(`${baseUrl}/v1/api/image-generator/google-signed-url?path=${encodeURIComponent(path)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.url) {
      urlCache.set(path, data.url);
      return data.url;
    }
    return null;
  } catch {
    return null;
  }
}

// Lazy loading image component
function LazyImage({ file, className }: { file: StorageFile; className?: string }) {
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
            if (signedUrl) {
              setUrl(signedUrl);
            } else {
              setError(true);
            }
            setLoading(false);
          });
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

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

  return (
    <img
      src={url}
      alt={file.name}
      class={className}
      loading="lazy"
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ProjectCard({ project }: { project: ProjectFolder }) {
  const [expanded, setExpanded] = useState(false);
  
  // Text files already have content from API
  const hasTextFiles = project.textFiles && project.textFiles.length > 0;

  return (
    <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div class="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span class="text-orange-500">📁</span>
              {project.folderName}
            </h3>
            <p class="text-xs text-gray-500 mt-1 font-mono">{project.path}</p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {project.images.length} image{project.images.length !== 1 ? 's' : ''}
            </span>
            {project.created && (
              <p class="text-xs text-gray-500 mt-1">{formatDate(project.created)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div class="p-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {project.images.slice(0, expanded ? undefined : 4).map((image, idx) => (
            <div
              key={idx}
              class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-orange-300 transition-all hover:shadow-lg cursor-pointer"
              onClick={async () => {
                const url = image.downloadUrl || await getSignedUrl(image.path);
                if (url) window.open(url, '_blank');
              }}
            >
              <LazyImage
                file={image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="absolute bottom-0 left-0 right-0 p-2">
                  <p class="text-white text-xs font-medium truncate">{image.name}</p>
                  <p class="text-white/70 text-xs">{formatFileSize(image.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show more images button */}
        {project.images.length > 4 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            class="mt-3 w-full py-2 text-sm text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 rounded-lg transition-colors"
          >
            Show all {project.images.length} images
          </button>
        )}
      </div>

      {/* Text Files / Prompts Section */}
      {hasTextFiles && (
        <div class="border-t border-gray-100 p-4 bg-gray-50">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-amber-500">📝</span>
            <span class="text-sm font-medium text-gray-700">
              {project.textFiles.length === 1 ? 'Prompt' : `Text Files (${project.textFiles.length})`}
            </span>
          </div>
          <div class="space-y-3">
            {project.textFiles.map((textFile, idx) => (
              <div key={idx} class="bg-white p-3 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1 font-mono">{textFile.name}</p>
                {textFile.content ? (
                  <p class="text-sm text-gray-600 whitespace-pre-wrap">{textFile.content}</p>
                ) : textFile.url ? (
                  <a 
                    href={textFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-sm text-orange-600 hover:underline"
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

export default function GoogleProjects() {
  const [projects, setProjects] = useState<ProjectFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${baseUrl}/v1/api/image-generator/google-projects`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setProjects(data);
      } catch (err: any) {
        setError(`Failed to load projects: ${err?.message || 'Unknown error'}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p class="mt-4 text-gray-500">Loading projects from Google Storage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p class="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl">☁️</span>
          Google Storage Projects
        </h1>
        <p class="text-gray-500 mt-1">
          Browse {projects.length} project{projects.length !== 1 ? 's' : ''} from Firebase Storage
        </p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <p class="text-3xl font-bold text-orange-600">{projects.length}</p>
          <p class="text-sm text-gray-600">Total Projects</p>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <p class="text-3xl font-bold text-blue-600">
            {projects.reduce((acc, p) => acc + p.images.length, 0)}
          </p>
          <p class="text-sm text-gray-600">Total Images</p>
        </div>
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p class="text-3xl font-bold text-green-600">
            {projects.filter((p) => p.textFiles && p.textFiles.length > 0).length}
          </p>
          <p class="text-sm text-gray-600">With Text Files</p>
        </div>
        <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <p class="text-3xl font-bold text-purple-600">
            {projects.length > 0
              ? Math.round(
                  projects.reduce((acc, p) => acc + p.images.length, 0) / projects.length
                )
              : 0}
          </p>
          <p class="text-sm text-gray-600">Avg Images/Project</p>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p class="text-gray-500">No projects found in Google Storage.</p>
        </div>
      ) : (
        <div>
          {projects.map((project, idx) => (
            <ProjectCard key={idx} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
