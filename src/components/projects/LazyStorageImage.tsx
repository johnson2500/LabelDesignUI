import { useEffect, useState, useRef } from 'preact/hooks';
import { getSignedUrl, type StorageFile } from '../../services/googleProjects.service';

export function LazyStorageImage({ file, className }: { file: StorageFile; className?: string }) {
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
