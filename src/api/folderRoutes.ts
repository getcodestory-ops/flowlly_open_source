import { type Session } from "@supabase/supabase-js";
import axios from "axios";

import { ContainerResources } from "@/types/document";
//types---------------------------------------------------------------------------------------------------------------
enum reqType {
  FOLDER = "subfolder",
  FILE = "files",
}

export type GetFolderFileProp = {
  id: string;
  name: string;
  created_at: string;
  parent_id: string;
  type_of: string;
  storage_relations: ContainerResources[];
};

export type GetFolderSubFolderProp = CreateFolderSubFolderProp & {
  storage_relations: ContainerResources[];
};

type CreateFolderSubFolderProp = {
  id: string;
  name: string;
  created_at: string;
  parent_id: string;
  type_of: string;
};

//apis----------------------------------------------------------------------------------------------------------------

export const fetchFolders = async (
  session: Session,
  projectId: string,
  folderId: string | null,
  callBack?: (data: any) => void
): Promise<GetFolderSubFolderProp[]> => {
  if (!session || !session.access_token) {
    return [];
  }
  const { baseUrl, data } = getUrlInput(
    session,
    reqType.FOLDER,
    projectId,
    folderId
  );
  try {
    const response = await axios.get<GetFolderSubFolderProp[]>(baseUrl, data);

    if (response.data) {
      if (callBack) {
        callBack(response.data);
      }
      return response.data;
    }

    throw new Error("No projects were found!");
  } catch (e) {
    console.error("Error in fetchFolders", e);
    throw new Error("Error in fetching data folders!");
  }
};

export const fetchFiles = async (
  session: Session,
  projectId: string,
  folderId: string | null,
  callBack?: (data: any) => void
) => {
  if (!session) {
    return;
  }
  const { baseUrl, data } = getUrlInput(
    session,
    reqType.FILE,
    projectId,
    folderId
  );

  const response = await axios.get<GetFolderFileProp[]>(baseUrl, data);

  if (callBack) {
    callBack(response.data);
  }

  return response.data;
};

export const createSubFolder = async (
  session: Session,
  projectId: string,
  folderName: string,
  parentId: string | null,
  callBack?: (data: any) => void
) => {
  if (!session) {
    return;
  }
  const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/subfolder/${projectId}`;

  const response = await axios.post<CreateFolderSubFolderProp>(
    baseUrl,
    {
      name: folderName,
      parent_id: parentId,
      type_of: "folder",
    },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (callBack) {
    callBack(response.data);
  }

  return response.data;
};

export const uploadFileInFolder = async (
  session: Session,
  projectId: string,
  file: File,
  folderId: string | null,
  callBack?: (data: any) => void
) => {
  if (!session) {
    return;
  }
  const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/${projectId}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder_id", folderId || "");

  const response = await axios.post<GetFolderFileProp>(baseUrl, formData, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  if (callBack) {
    callBack(response.data);
  }

  return response.data;
};

export const deleteFolder = async (
  session: Session,
  projectId: string,
  folderId: string | null,
  callBack?: (data: any) => void
) => {
  if (!session) {
    return;
  }
  const { baseUrl, data } = getUrlInput(
    session,
    reqType.FOLDER,
    projectId,
    folderId
  );

  const response = await axios.get<GetFolderSubFolderProp[]>(baseUrl, data);

  if (callBack) {
    callBack(response.data);
  }

  return response.data;
};

//helpers------------------------------------------------------------------------------------------------------------

const getUrlInput = (
  session: Session,
  reqType: reqType,
  projectId: string,
  folderId: string | null
) => {
  return {
    baseUrl: `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/${reqType}/${projectId}`,
    data: {
      params: {
        folder_id: folderId,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  };
};
