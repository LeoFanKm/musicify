import { create } from 'zustand';
import { Project, CreationMode, SongSpec } from '@shared/types';
import { api } from '../utils/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (spec: SongSpec, mode: CreationMode) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  generateLyrics: (projectId: string, mode: CreationMode) => Promise<string>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Project[]>('/projects');
      set({ projects: response.data || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      set({ currentProject: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createProject: async (spec: SongSpec, mode: CreationMode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Project>('/projects', {
        spec,
        mode,
        title: `${spec.type}歌曲 - ${new Date().toLocaleDateString()}`,
      });

      const newProject = response.data!;
      set((state) => ({
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false,
      }));

      return newProject;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const response = await api.patch<Project>(`/projects/${id}`, updates);

      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? response.data! : p)),
        currentProject: state.currentProject?.id === id ? response.data! : state.currentProject,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
      });
      throw error;
    }
  },

  generateLyrics: async (projectId: string, mode: CreationMode) => {
    const project = get().currentProject;
    if (!project) throw new Error('No project selected');

    const response = await api.post<{ lyrics: string }>(`/projects/${projectId}/generate`, {
      mode,
      spec: project.spec,
      theme: project.theme,
    });

    const lyrics = response.data!.lyrics;

    // 更新项目
    await get().updateProject(projectId, { lyrics });

    return lyrics;
  },
}));
