import { baseUrl } from '../constants';
import type { Project } from '../types/project.types';

export const PAGE_SIZE = 20;
const FETCH_LIMIT = 500;

export async function fetchCustomerProjects(): Promise<Project[]> {
  const res = await fetch(`${baseUrl}/internal/projects?offset=0&limit=${FETCH_LIMIT}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Project[] = await res.json();
  data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return data;
}
