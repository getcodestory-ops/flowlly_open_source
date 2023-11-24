import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { ActivityEntity, CreateNewActivity } from "@/types/activities";

export const getActivities = async (
  session: Session,
  projectId: string,
  date: string = getCurrentDateFormatted(),
  probability: number = 0.0
): Promise<ActivityEntity[]> => {
  console.log(date);
  const query = {
    date: date,
    probability: probability,
  };

  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activities/${projectId}`;
  const response = await axios.get(url, {
    params: query,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data.activities;
};

export const createActivity = async (
  session: Session,
  activity: CreateNewActivity
): Promise<ActivityEntity | null> => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activity`;
  const response = await axios.post(url, activity, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data?.activity!;
};

export const updateActivity = async (
  session: Session,
  activity: string,
  activityData: {
    name?: string;
    project_id?: string;
    description?: string;
    duration?: number;
    start?: string;
    end?: string;
    cost?: number;
    dependencies?: string[];
    resources?: string[];
    status?: string;
    created_by?: string;
    owner?: string;
    progress?: number;
  }
): Promise<ActivityEntity | null> => {
  if (!session.access_token) return null;

  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activities/${activity}/update`;
  console.log("activityData", activityData);
  try {
    const response = await axios.put(
      url,
      activityData, // Send the activity data as the request body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    return response.data?.activity!;
  } catch (error) {
    // Handle any errors here
    console.error("Error updating activity:", error);
    return null;
  }
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

export const uploadCSVData = async ({
  session,
  projectId,
  formData,
}: {
  session: Session;
  projectId: string;
  formData: FormData;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activities/${projectId}/csv_upload`;
  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export const getRevisions = async (session: Session, ProjectId: string) => {
  if (!session.access_token) return [];
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activities/revisions/${ProjectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};
