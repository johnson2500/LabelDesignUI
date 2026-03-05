export interface ShopifyReference {
  id: string;
  shopifyId: string;
  handle: string;
  title: string;
}

export interface ProjectFile {
  name: string;
  size?: number;
  type: string;
  lastModified?: number;
  status: string;
  error?: string;
  bundleId?: string;
  storagePath: string;
  fileId?: string;
  fileType?: string;
  downloadUrl?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

export interface Summary {
  turnaroundName: string;
  turnaround: string;
  projectName: string;
  dueDate: string;
  package?: string;
  packageName?: string;
  customDate?: string;
}

export interface EditItem {
  id: number;
  type: string;
  description: string;
  needsFile: boolean;
  files: ProjectFile[];
  isFree: boolean;
  fileUploadValid: boolean;
}

interface BaseProject {
  id: string;
  bundleId: string;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  cartId?: string;
}

export interface NewProject extends BaseProject {
  formData: {
    selection: ShopifyReference & { selectionType: 'new' };
    projectType: { name: string; id: string };
    summary: Summary;
    designType: Partial<ShopifyReference> & { type: string | null };
    design: {
      uploadedFiles: ProjectFile[];
      shape: { displayName: string; id: string } | null;
      size: { displayName: string; isCustom: boolean; id: string } | null;
      customDimensions: any | null;
      designDescription: string;
      bundleId: string;
      customFileTypeInput: { show: boolean; value: string };
      fileTypes: {
        preSelectedFileTypes: string[];
        additionalFileTypes: string[];
      };
    };
    edit: {
      editItems: [];
      files: [];
    };
  };
}

export interface EditProject extends BaseProject {
  formData: {
    selection: ShopifyReference & { selectionType: 'edit' };
    projectType: { name: string; id: string };
    summary: Summary;
    edit: {
      editItems: EditItem[];
      files: ProjectFile[];
    };
    designType: { type: null };
    design: {
      uploadedFiles: [];
      shape: null;
      size: null;
      customDimensions: null;
    };
  };
}

export type Project = NewProject | EditProject;

export function isNewProject(p: Project): p is NewProject {
  return p.formData.selection.selectionType === 'new';
}

export function isEditProject(p: Project): p is EditProject {
  return p.formData.selection.selectionType === 'edit';
}
