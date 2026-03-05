import { useState } from 'preact/hooks';
import {
  getSignedUrl,
  type GoogleProjectFolder,
  type TextFile,
} from '../../services/googleProjects.service';
import { formatDate, formatBytes } from '../../utils/format';
import { LazyStorageImage } from './LazyStorageImage';

export function GoogleProjectCard({ project }: { project: GoogleProjectFolder }) {
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
                const url = image.downloadUrl || (await getSignedUrl(image.path));
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
