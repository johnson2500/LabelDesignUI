import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';

// Firebase configuration
// Get your web API key from: Firebase Console > Project Settings > General > Web API Key
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBAjL-wiU2m9CRAMUbg3zTvMTHRsyewGcw",
  authDomain: "labeldesign-ai-524ca.firebaseapp.com",
  projectId: "labeldesign-ai-524ca",
  storageBucket: "labeldesign-ai-524ca.firebasestorage.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  created: Date | null;
  contentType: string;
  downloadUrl: string;
}

export interface ProjectFolder {
  path: string;
  folderName: string;
  images: StorageFile[];
  prompt: string | null;
  created: Date | null;
}

function isImageFile(filename: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const lower = filename.toLowerCase();
  return imageExtensions.some((ext) => lower.endsWith(ext));
}

function isTextFile(filename: string): boolean {
  const textExtensions = ['.txt', '.md', '.json', '.prompt'];
  const lower = filename.toLowerCase();
  return textExtensions.some((ext) => lower.endsWith(ext)) || lower.includes('prompt');
}

export async function listFiles(prefix: string = ''): Promise<StorageFile[]> {
  try {
    console.log(`[Firebase] Listing files with prefix: "${prefix}"`);
    const listRef = ref(storage, prefix);
    const result = await listAll(listRef);
    
    console.log(`[Firebase] Found ${result.items.length} files and ${result.prefixes.length} folders in "${prefix}"`);
    
    // Log folder names for debugging
    if (result.prefixes.length > 0) {
      console.log('[Firebase] Folders:', result.prefixes.map(f => f.fullPath));
    }
    
    const files: StorageFile[] = [];
    
    // Process files in current folder
    for (const itemRef of result.items) {
      try {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef)
        ]);
        
        files.push({
          name: itemRef.name,
          path: itemRef.fullPath,
          size: metadata.size || 0,
          created: metadata.timeCreated ? new Date(metadata.timeCreated) : null,
          contentType: metadata.contentType || 'application/octet-stream',
          downloadUrl: url
        });
      } catch (err) {
        console.warn(`[Firebase] Failed to get file info for ${itemRef.fullPath}:`, err);
      }
    }
    
    // Recursively process subfolders
    for (const folderRef of result.prefixes) {
      const subFiles = await listFiles(folderRef.fullPath);
      files.push(...subFiles);
    }
    
    console.log(`[Firebase] Total files found under "${prefix}": ${files.length}`);
    return files;
  } catch (error) {
    console.error('[Firebase] Error listing files:', error);
    throw error; // Re-throw to see the actual error
  }
}

export async function getProjects(prefix: string = 'projects/'): Promise<ProjectFolder[]> {
  const files = await listFiles(prefix);
  
  if (files.length === 0) {
    return [];
  }
  
  // Organize files by folder
  const projects = new Map<string, ProjectFolder>();
  
  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length < 2) continue;
    
    const folderPath = parts.slice(0, -1).join('/');
    const folderName = parts[parts.length - 2] || folderPath;
    
    if (!projects.has(folderPath)) {
      projects.set(folderPath, {
        path: folderPath,
        folderName: folderName,
        images: [],
        prompt: null,
        created: null
      });
    }
    
    const project = projects.get(folderPath)!;
    
    if (isImageFile(file.name)) {
      project.images.push(file);
      if (file.created) {
        if (project.created === null || file.created > project.created) {
          project.created = file.created;
        }
      }
    } else if (isTextFile(file.name)) {
      project.prompt = file.downloadUrl;
    }
  }
  
  // Filter to only projects with images and sort by date (newest first)
  return Array.from(projects.values())
    .filter((p) => p.images.length > 0)
    .sort((a, b) => {
      const dateA = a.created?.getTime() || 0;
      const dateB = b.created?.getTime() || 0;
      return dateB - dateA;
    });
}

export { storage };
