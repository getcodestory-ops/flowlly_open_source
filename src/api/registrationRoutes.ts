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
