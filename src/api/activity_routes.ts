import { type Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import type {
  ActivityEntity,
  CreateNewActivity,
  UpdateActivityTypes,
} from "@/types/activities";

export const getActivities = async (
  session: Session,
  projectId: string,
  date: string = getCurrentDateFormatted(),
  probability: number = 0.0
): Promise<ActivityEntity[]> => {
  // console.log(date);
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
  projectId: string,
  activity: UpdateActivityTypes
) => {
  if (!session.access_token) return null;

  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project/${projectId}/update_activity`;

  try {
    const response = await axios.put(url, activity, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

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

export const getActivityContingencyPlan = async (
  session: Session,
  ProjectId: string,
  activityId?: string
) => {
  if (!session.access_token) return [];
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/activity/contingency_plan/${ProjectId}`;

  const response = await axios.get(url, {
    params: { activity_id: activityId },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

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
