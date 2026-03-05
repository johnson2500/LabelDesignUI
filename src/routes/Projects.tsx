import { useEffect, useMemo, useState } from 'preact/hooks';
import { fetchCustomerProjects, PAGE_SIZE } from '../services/projects.service';
import {
  fetchGoogleProjects,
  type GoogleProjectFolder,
} from '../services/googleProjects.service';
import type { Project } from '../types/project.types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { GoogleProjectCard } from '../components/projects/GoogleProjectCard';

type Tab = 'customers' | 'google';

export default function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('customers');

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [googleProjects, setGoogleProjects] = useState<GoogleProjectFolder[]>([]);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(allProjects.length / PAGE_SIZE));
  const pagedProjects = useMemo(
    () => allProjects.slice(customerPage * PAGE_SIZE, (customerPage + 1) * PAGE_SIZE),
    [allProjects, customerPage],
  );

  const loadCustomerProjects = async () => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const data = await fetchCustomerProjects();
      setAllProjects(data);
      setCustomerPage(0);
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

  useEffect(() => {
    loadCustomerProjects();
    loadGoogleProjects();
  }, []);

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
              {allProjects.length}
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

      {/* Customer Projects Tab */}
      {activeTab === 'customers' && (
        <div>
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-500">
              Sorted by date · most recent first · {allProjects.length} total · {PAGE_SIZE} per page
            </p>
          </div>

          {customerError && (
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
              <p class="text-red-600">{customerError}</p>
              <button
                onClick={loadCustomerProjects}
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
                </div>
              ))}
            </div>
          )}

          {!customerLoading && !customerError && allProjects.length === 0 && (
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p class="text-gray-500">No projects found.</p>
            </div>
          )}

          {!customerLoading && pagedProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}

          {!customerLoading && !customerError && allProjects.length > 0 && (
            <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p class="text-xs text-gray-500">
                Page {customerPage + 1} of {totalPages}
                <span> · Showing {customerPage * PAGE_SIZE + 1}–{Math.min((customerPage + 1) * PAGE_SIZE, allProjects.length)} of {allProjects.length}</span>
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
                  disabled={customerPage >= totalPages - 1}
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Storage Tab */}
      {activeTab === 'google' && (
        <div>
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
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent" />
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
