import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { ActivityEntity, CreateNewActivity } from "@/types/activities";

export const getActivities = async (
  session: Session,
  projectId: string
): Promise<ActivityEntity[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activities/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
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

export const deleteActivity = async ({
  session,
  projectId,
  activityId,
}: {
  session: Session;
  projectId: string;
  activityId: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activity/${projectId}/${activityId}`;
  const response = await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};
