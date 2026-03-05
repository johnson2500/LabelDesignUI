import { useState } from 'preact/hooks';
import type { Project, ProjectFile } from '../../types/project.types';
import { isNewProject } from '../../types/project.types';
import { formatDate } from '../../utils/format';
import { Detail } from './Detail';
import { StepBadge } from './StepBadge';
import { FilePreview } from './FilePreview';

function FileGrid({ files, label }: { files: ProjectFile[]; label: string }) {
  if (files.length === 0) return null;
  return (
    <div class="border-t border-gray-100 px-4 pb-5">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 mb-3">
        {label} ({files.length})
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {files.map((f, i) => (
          <FilePreview key={i} file={f} />
        ))}
      </div>
    </div>
  );
}

function NewProjectDetails({ project }: { project: Project }) {
  if (!isNewProject(project)) return null;
  const { design, designType } = project.formData;
  return (
    <>
      <Detail label="Design Type" value={designType?.title} />
      <Detail label="Shape" value={design?.shape?.displayName} />
      <Detail label="Size" value={design?.size?.displayName} />
    </>
  );
}

function NewProjectDescription({ project }: { project: Project }) {
  if (!isNewProject(project) || !project.formData.design?.designDescription) return null;
  return (
    <div class="col-span-2 sm:col-span-3 md:col-span-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
      <p class="text-sm text-gray-700">{project.formData.design.designDescription}</p>
    </div>
  );
}

function EditItemsList({ project }: { project: Project }) {
  if (isNewProject(project)) return null;
  const { editItems } = project.formData.edit;
  if (editItems.length === 0) return null;

  return (
    <div class="border-t border-gray-100 px-4 pb-4">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 mb-3">
        Edit Items ({editItems.length})
      </p>
      <div class="space-y-3">
        {editItems.map((item) => (
          <div key={item.id} class="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
              <div class="flex items-center gap-2">
                {item.isFree && (
                  <span class="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Free</span>
                )}
                {item.needsFile && (
                  <span class="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">File required</span>
                )}
              </div>
            </div>
            <p class="text-sm text-gray-600">{item.description}</p>
            {item.files.length > 0 && (
              <div class="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.files.map((f, i) => (
                  <FilePreview key={i} file={f} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const { summary, projectType, selection } = project.formData;
  const isNew = isNewProject(project);
  const uploadedFiles = isNew ? project.formData.design?.uploadedFiles ?? [] : [];
  const sourceFiles = !isNew ? project.formData.edit?.files ?? [] : [];

  const selectionColor = isNew
    ? 'bg-orange-100 text-orange-700'
    : 'bg-violet-100 text-violet-700';

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
            <div class="flex items-center gap-2">
              <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectionColor}`}>
                {isNew ? 'New' : 'Edit'}
              </span>
              <StepBadge step={project.currentStep} />
            </div>
            <p class="text-xs text-gray-400">{formatDate(project.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Detail label="Package" value={summary?.packageName} />
        <Detail label="Turnaround" value={summary?.turnaroundName} />
        <Detail label="Due Date" value={formatDate(summary?.dueDate)} />
        <Detail label="Project Type" value={projectType?.name} />
        <Detail label="Selection" value={selection?.title} />
        <NewProjectDetails project={project} />
        <NewProjectDescription project={project} />
      </div>

      {/* New project uploaded files */}
      <FileGrid files={uploadedFiles} label="Uploaded Files" />

      {/* Edit project items */}
      <EditItemsList project={project} />

      {/* Edit project source files */}
      <FileGrid files={sourceFiles} label="Source Files" />

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
            {isNew && project.formData.design?.fileTypes?.preSelectedFileTypes?.length ? (
              <Detail label="Accepted File Types" value={project.formData.design.fileTypes.preSelectedFileTypes.join(', ')} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
