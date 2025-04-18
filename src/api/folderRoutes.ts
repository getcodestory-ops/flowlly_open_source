import { type Session } from "@supabase/supabase-js";
import axios from "axios";

import { ContainerResources, StorageResourceEntity } from "@/types/document";
//types---------------------------------------------------------------------------------------------------------------
enum reqType {
  FOLDER = "subfolder",
  FILE = "files",
  DELETE = "folder",
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

export const fetchResource = async(
	session: Session | null,
	projectId: string | undefined,
	resourceId: string,
): Promise<StorageResourceEntity | undefined> => {
	if (!session || !projectId) {
		return;
	}

	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/resource/${projectId}/${resourceId}`;

	const response = await axios.get(baseUrl, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const fetchFolders = async(
	session: Session,
	projectId: string,
	folderId: string | null,
	isProjectWide: boolean,
	callBack?: (data: any) => void,
): Promise<GetFolderSubFolderProp[]> => {
	if (!session || !session.access_token) {
		return [];
	}
	const { baseUrl, data } = getUrlInput(
		session,
		reqType.FOLDER,
		projectId,
		folderId,
		isProjectWide,
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

export const fetchFiles = async(
	session: Session,
	projectId: string,
	folderId: string | null,
	isProjectWide: boolean,
	callBack?: (data: any) => void,
) => {
	if (!session) {
		return;
	}
	const { baseUrl, data } = getUrlInput(
		session,
		reqType.FILE,
		projectId,
		folderId,
		isProjectWide,
	);

	const response = await axios.get<GetFolderFileProp[]>(baseUrl, data);

	if (callBack) {
		callBack(response.data);
	}

	return response.data;
};

export const createSubFolder = async(
	session: Session,
	projectId: string,
	folderName: string,
	parentId: string | null,
	shared?: boolean,
	callBack?: (data: any) => void,
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
			shared: shared ?? false,
		},
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);

	if (callBack) {
		callBack(response.data);
	}

	return response.data;
};

export const uploadFileInFolder = async(
	session: Session,
	projectId: string,
	file: File,
	folderId: string | null,
	callBack?: (data: any) => void,
	onProgress?: (progress: number) => void,
) => {
	if (!session) {
		return;
	}
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/${projectId}`;

	const formData = new FormData();
	formData.append("file", file);
	formData.append("folder_id", folderId || "");
	formData.append("extract_method", "unstructured");

	// If progress tracking is requested, use axios with progress event
	if (onProgress) {
		const response = await axios.post<GetFolderFileProp>(baseUrl, formData, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "multipart/form-data",
			},
			onUploadProgress: (progressEvent) => {
				const percentCompleted = progressEvent.total
					? Math.round((progressEvent.loaded * 100) / progressEvent.total)
					: 0;
				onProgress(percentCompleted);
			},
		});

		if (callBack) {
			callBack(response.data);
		}

		return response.data;
	} else {
		// Original implementation without progress tracking
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
	}
};

export const createDocumentInFolder = async(
	session: Session,
	projectId: string,
	fileName: string,
	folderId: string,
	callBack?: (data: any) => void,
) => {
	if (!session) {
		return;
	}
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/text/file/${projectId}`;

	const response = await axios.post<GetFolderFileProp>(
		baseUrl,
		{
			file_name: fileName,
			folder_id: folderId,
			project_access_id: projectId,
		},
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		},
	);

	if (callBack) {
		callBack(response.data);
	}

	return response.data;
};

export const deleteFolder = async(
	session: Session,
	projectId: string,
	folderId: string | null,
	callBack?: (data: any) => void,
) => {
	if (!session) {
		return;
	}
	const { baseUrl, data } = getUrlInput(
		session,
		reqType.DELETE,
		projectId,
		folderId,
	);

	const response = await axios.delete(baseUrl, data);

	if (callBack) {
		callBack(response.data);
	}

	return response.data;
};

//_________________________

export const deleteFile = async({
	session,
	projectId,
	fileId,
}: {
  session: Session;
  projectId: string;
  fileId: string;
}) => {
	if (!session) {
		return;
	}

	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/${projectId}`;

	const params = {
		file_id: fileId,
	};

	const response = await axios.delete(baseUrl, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
		params,
	});

	return response.data;
};
export const uploadImageForEditor = async({
	session,
	projectId,
	file,
}: {
  session: Session;
  projectId: string;
  file: File;
}) => {
	if (!session) {
		throw new Error("No session provided");
	}

	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/image/${projectId}`;

	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await axios.post(baseUrl, formData, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "multipart/form-data",
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error uploading image:", error);
		throw error;
	}
};

//helpers------------------------------------------------------------------------------------------------------------

const getUrlInput = (
	session: Session,
	reqType: reqType,
	projectId: string,
	folderId: string | null,
	isProjectWide?: boolean,
) => {
	return {
		baseUrl: `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/${reqType}/${projectId}`,
		data: {
			params: {
				folder_id: folderId,
				is_project_wide: isProjectWide,
			},
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	};
};


export const getInlineFileUrl = async({
	session,
	projectId,
	resourceId,
}: {
	session: Session;
	projectId: string;
	resourceId: string;
}) : Promise<string | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/view/${projectId}/${resourceId}`;

	try {
		const response = await axios.get(baseUrl, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error getting inline file url:", error);
		return null;
	}
};
