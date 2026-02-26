import { baseUrl } from '../constants';

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  created: string | null;
  contentType: string;
  downloadUrl?: string;
}

export interface TextFile {
  name: string;
  path: string;
  url?: string;
  content?: string;
}

export interface GoogleProjectFolder {
  path: string;
  folderName: string;
  images: StorageFile[];
  textFiles: TextFile[];
  created: string | null;
}

const signedUrlCache = new Map<string, string>();

export async function getSignedUrl(path: string): Promise<string | null> {
  if (signedUrlCache.has(path)) return signedUrlCache.get(path)!;
  try {
    const res = await fetch(
      `${baseUrl}/v1/api/image-generator/google-signed-url?path=${encodeURIComponent(path)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.url) {
      signedUrlCache.set(path, data.url);
      return data.url;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchGoogleProjects(): Promise<GoogleProjectFolder[]> {
  const res = await fetch(`${baseUrl}/v1/api/image-generator/google-projects`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
