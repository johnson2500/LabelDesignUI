import { baseUrl } from '../constants';

export interface UploadedFile {
  fileId: string;
  name: string;
  fileType: string;
  status: string;
  size: number;
  type: string;
  storagePath: string;
  error?: string;
}

export interface ProjectDesign {
  bundleId?: string;
  designDescription?: string;
  shape?: { displayName: string; id: string };
  size?: { displayName: string; id: string; isCustom: boolean };
  uploadedFiles?: UploadedFile[];
  designType?: { title: string; handle: string };
  fileTypes?: { preSelectedFileTypes: string[]; additionalFileTypes: string[] };
}

export interface ProjectSummary {
  projectName?: string;
  packageName?: string;
  turnaroundName?: string;
  dueDate?: string;
}

export interface ProjectFormData {
  design?: ProjectDesign;
  summary?: ProjectSummary;
  projectType?: { id: string; name: string };
  selection?: { title: string; selectionType: string };
}

export interface CustomerProject {
  id: string;
  bundleId?: string;
  cartId?: string;
  createdAt?: string;
  updatedAt?: string;
  currentStep?: string;
  formData?: ProjectFormData;
}

export const PAGE_SIZE = 20;

export async function fetchCustomerProjects(page: number): Promise<CustomerProject[]> {
  const offset = page * PAGE_SIZE;
  const res = await fetch(`${baseUrl}/internal/projects?offset=${offset}&limit=${PAGE_SIZE}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
