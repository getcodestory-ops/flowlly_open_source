import { type Session } from "@supabase/supabase-js";
import { UpdateProperties } from "@/types/updates";
import axios from "axios";

export const integrateApi = async (
  session: Session,
  project_access_id: string,
  apiKey: string
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integrate/microsoft/${project_access_id}`;
  const response = await axios.post(
    url,
    {
      api_key: apiKey,
    },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  return response.data;
};

export const getApiIntegration = async (
  session: Session,
  project_access_id: string,
  integration_type: string = "microsoft"
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integration/${integration_type}/${project_access_id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};

export const createExcelSheet = async (
  session: Session,
  project_access_id: string,
  file_name: string,
  table_headers: string[]
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/onedrive/create_table/${project_access_id}`;
  const response = await axios.post(
    url,
    {
      file_name,
      table_headers,
    },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  return response.data;
};
