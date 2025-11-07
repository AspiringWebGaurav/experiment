"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectOperationResult,
  validateProject,
  MAX_PROJECTS,
  shouldWarnAsymmetric,
} from "@/types/project";
import { toast } from "sonner";
import { useRecycleBin } from "./RecycleBinContext";

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: CreateProjectDTO) => Promise<ProjectOperationResult>;
  updateProject: (project: UpdateProjectDTO) => Promise<ProjectOperationResult>;
  deleteProject: (id: string) => Promise<ProjectOperationResult>;
  toggleProjectActive: (id: string) => Promise<ProjectOperationResult>;
  reorderProjects: (
    projectId: string,
    newOrder: number
  ) => Promise<ProjectOperationResult>;
  canAddMoreProjects: () => boolean;
  getActiveProjectsCount: () => number;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { moveToRecycleBin } = useRecycleBin();

  /**
   * Fetch all projects from the API
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch projects");
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const projectsWithDates = data.projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      setProjects(projectsWithDates);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching projects:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new project
   */
  const createProject = useCallback(
    async (project: CreateProjectDTO): Promise<ProjectOperationResult> => {
      // Check max projects limit
      if (projects.length >= MAX_PROJECTS) {
        const result = {
          success: false,
          error: `Maximum ${MAX_PROJECTS} projects allowed. Please delete a project before adding a new one.`,
        };
        toast.error(result.error);
        return result;
      }

      // Validate project data
      const validationErrors = validateProject(project);
      if (validationErrors.length > 0) {
        const result = {
          success: false,
          error: "Validation failed",
          validationErrors,
        };
        toast.error(validationErrors[0].message);
        return result;
      }

      // Check for asymmetric warning
      const asymmetricCheck = shouldWarnAsymmetric(projects.length);
      if (asymmetricCheck.shouldWarn && asymmetricCheck.message) {
        toast.warning(asymmetricCheck.message, { duration: 5000 });
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(project),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create project");
        }

        const data = await response.json();
        const newProject = {
          ...data.project,
          createdAt: new Date(data.project.createdAt),
          updatedAt: new Date(data.project.updatedAt),
        };

        setProjects((prev) =>
          [...prev, newProject].sort((a, b) => a.order - b.order)
        );
        toast.success("Project created successfully! 🎉");

        return { success: true, data: newProject };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error creating project:", err);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [projects]
  );

  /**
   * Update an existing project
   */
  const updateProject = useCallback(
    async (project: UpdateProjectDTO): Promise<ProjectOperationResult> => {
      // Validate project data
      const validationErrors = validateProject(project);
      if (validationErrors.length > 0) {
        const result = {
          success: false,
          error: "Validation failed",
          validationErrors,
        };
        toast.error(validationErrors[0].message);
        return result;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(project),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update project");
        }

        const data = await response.json();
        const updatedProject = {
          ...data.project,
          createdAt: new Date(data.project.createdAt),
          updatedAt: new Date(data.project.updatedAt),
        };

        setProjects((prev) =>
          prev
            .map((p) => (p.id === updatedProject.id ? updatedProject : p))
            .sort((a, b) => a.order - b.order)
        );
        toast.success("Project updated successfully! ✅");

        return { success: true, data: updatedProject };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error updating project:", err);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete a project (moves to recycle bin first)
   */
  const deleteProject = useCallback(
    async (id: string): Promise<ProjectOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        // Find the project to delete
        const project = projects.find((p) => p.id === id);
        if (!project) {
          throw new Error("Project not found");
        }

        // Move to recycle bin first
        await moveToRecycleBin("project", project, id);

        // Then delete from Firestore
        const response = await fetch("/api/projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete project");
        }

        // Remove from local state
        setProjects((prev) => prev.filter((p) => p.id !== id));

        // Note: Success toast is shown by moveToRecycleBin
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error deleting project:", err);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [projects, moveToRecycleBin]
  );

  /**
   * Toggle project active status
   */
  const toggleProjectActive = useCallback(
    async (id: string): Promise<ProjectOperationResult> => {
      const project = projects.find((p) => p.id === id);
      if (!project) {
        const result = { success: false, error: "Project not found" };
        toast.error(result.error);
        return result;
      }

      return updateProject({
        id,
        isActive: !project.isActive,
      });
    },
    [projects, updateProject]
  );

  /**
   * Reorder projects
   */
  const reorderProjects = useCallback(
    async (
      projectId: string,
      newOrder: number
    ): Promise<ProjectOperationResult> => {
      if (newOrder < 1 || newOrder > MAX_PROJECTS) {
        const result = {
          success: false,
          error: `Order must be between 1 and ${MAX_PROJECTS}`,
        };
        toast.error(result.error);
        return result;
      }

      return updateProject({
        id: projectId,
        order: newOrder,
      });
    },
    [updateProject]
  );

  /**
   * Check if more projects can be added
   */
  const canAddMoreProjects = useCallback(() => {
    return projects.length < MAX_PROJECTS;
  }, [projects]);

  /**
   * Get count of active projects (shown on frontend)
   */
  const getActiveProjectsCount = useCallback(() => {
    return projects.filter((p) => p.isActive).length;
  }, [projects]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectActive,
    reorderProjects,
    canAddMoreProjects,
    getActiveProjectsCount,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

/**
 * Custom hook to use the ProjectContext
 */
export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
