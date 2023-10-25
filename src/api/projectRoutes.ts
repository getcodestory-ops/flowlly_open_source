import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { ProjectEntity, CreateNewProjectEntity } from "@/types/projects";

export const getProjects = async (
  session: Session
): Promise<ProjectEntity[]> => {
  if (!session.access_token) return [];
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/projects`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data?.projects;
};

export const createProject = async (
  session: Session,
  project: CreateNewProjectEntity
): Promise<ProjectEntity | null> => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project`;
  const response = await axios.post(url, project, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data?.project!;
};

export const deleteProject = async (session: Session, project_id: string) => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project/${project_id}`;
  const response = await axios.delete(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response;
};
