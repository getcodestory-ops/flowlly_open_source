import { Session } from "@supabase/supabase-js";
import { ProjectEntity } from "../types/project";

const API_URL = "https://fastapi.eastus.cloudapp.azure.com"; // Replace with your actual API URL

export const getProjects = async (
  session: Session,
  type: string = "SCHEDULE"
): Promise<ProjectEntity[]> => {
  if (!session.access_token) return [];

  const response = await fetch(`${API_URL}/projects?project_type=${type}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.projects || [];
};
