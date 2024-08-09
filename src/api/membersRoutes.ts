import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { MemberEntity } from "@/types/members";

export const getMembers = async (session: Session, projectId: string) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/directory/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};

export const createNewMemberEntry = async (
  sessionToken: Session,
  projectAccessId: string,
  projectDetails: {
    project_id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    responsibilities: string;
    skills: string;
    active: boolean;
    enable_sms: boolean;
    language?: string;
  }
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/directory/${projectAccessId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken!.access_token}`,
      },
      body: JSON.stringify(projectDetails),
    }
  );

  if (!response.ok) {
    // Handle response error
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("data", data);
  return data;
};

export const updateMemberEntity = async (
  sessionToken: Session,
  projectAccessId: string,
  projectDetails: MemberEntity
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/directory/${projectAccessId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken!.access_token}`,
      },
      body: JSON.stringify(projectDetails),
    }
  );

  if (!response.ok) {
    // Handle response error
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
