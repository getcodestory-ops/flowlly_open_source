import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { MemberEntity } from "@/types/members";
import { RegisterPhoneChat } from "@/types/registerPhone";

export const addPhoneChats = async (
  session: Session,
  projectAcessId: string,
  registerPhoneChat: RegisterPhoneChat
) => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/registration/${projectAcessId}`;
  const response = await axios.post(url, registerPhoneChat, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data?.project!;
};

export const removePhoneRegister = async (
  session: Session,
  projectAcessId: string,
  phoneNumber: string
) => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/deregister/sms/${projectAcessId}`;
  const response = await axios.delete(url, {
    params: { phone_number: phoneNumber },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data?.project!;
};

export const removeDirectoryEntry = async (
  session: Session,
  projectAcessId: string,
  email: string
) => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/directory/${projectAcessId}`;
  const response = await axios.delete(url, {
    params: { email: email },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data?.project!;
};
