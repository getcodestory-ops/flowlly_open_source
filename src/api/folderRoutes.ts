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
	isSandboxFile?: boolean,
	fileName?: string,
): Promise<StorageResourceEntity | undefined> => {
	if (!session || !projectId) {
		return;
	}

	let baseUrl: string;
	if (isSandboxFile) {
		// For sandbox files, use the file/view endpoint with query parameters
		baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/view/${projectId}/${resourceId}`;
		const params = new URLSearchParams();
		params.append("is_sandbox_file", "true");
		if (fileName) {
			params.append("file_name", fileName);
		}
		baseUrl = `${baseUrl}?${params.toString()}`;
	} else {
		// For regular storage files, use the resource endpoint
		baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/resource/${projectId}/${resourceId}`;
	}

	const response = await axios.get(baseUrl, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};


export const fetchAtSelector = async(
	session: Session,
	projectId: string,
) => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/all/${projectId}`;

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
	if (!session || !session.access_token || folderId === "root") {
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
	if (!session || folderId === "root") {
		return [];
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
	if (folderId) {
		formData.append("folder_id", folderId);
	}
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

export const saveDocumentAs = async(
	session: Session,
	projectId: string,
	documentId: string,
	folderId: string,
) : Promise<StorageResourceEntity | undefined> => {
	try {
		const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/folder/saveasdocument/${projectId}`;
		const response = await axios.put(baseUrl, {
			document_id: documentId,
			folder_id: folderId,
		}, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error saving document as:", error);
		return undefined;
	}
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
	folderId,
}: {
  session: Session;
  projectId: string;
  fileId: string;
  folderId: string;
}) => {
	if (!session) {
		return;
	}

	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/${projectId}`;

	const params = {
		file_id: fileId,
		folder_id: folderId,
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


export const updateSandboxFile = async({
	session,
	projectId,
	sandboxId,
	fileName,
	updatedContent,
}: {
	session: Session;
	projectId: string;
	sandboxId: string;
	fileName: string;
	updatedContent: string;
}) : Promise<{ message: string }> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/sandbox/${projectId}/${sandboxId}/file`;
	
	try {
		const response = await axios.put(baseUrl, {
			file_name: fileName,
			updated_content: updatedContent,
		}, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error updating sandbox file:", error);
		throw error;
	}
};

export const getInlineDocument = async({
	session,
	projectId,
	resourceId,
	isSandboxFile,
	fileName,
}: {
	session: Session;
	projectId: string;
	resourceId: string;
	isSandboxFile?: boolean;
	fileName?: string;
}) : Promise<StorageResourceEntity | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/view/${projectId}/${resourceId}`;
	
	// Build query parameters for sandbox files
	const params = new URLSearchParams();
	if (isSandboxFile) {
		params.append("is_sandbox_file", "true");
		if (fileName) {
			params.append("file_name", fileName);
		}
	}
	
	const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

	try {
		const response = await axios.get(fullUrl, {
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

/**
 * Fetch sandbox image as a data URL
 * Uses native fetch with Accept header to request raw binary
 */
export const getSandboxImageAsDataUrl = async({
	session,
	projectId,
	sandboxId,
	fileName,
}: {
	session: Session;
	projectId: string;
	sandboxId: string;
	fileName: string;
}): Promise<string | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/view/${projectId}/${sandboxId}`;
	const params = new URLSearchParams();
	params.append("is_sandbox_file", "true");
	params.append("file_name", fileName);
	const fullUrl = `${baseUrl}?${params.toString()}`;

	// Get MIME type from file extension
	const ext = fileName.split(".").pop()?.toLowerCase() || "png";
	const mimeTypes: Record<string, string> = {
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		ico: "image/x-icon",
		bmp: "image/bmp",
	};
	const mimeType = mimeTypes[ext] || "image/png";

	try {
		// Use native fetch with Accept header to request raw binary
		const response = await fetch(fullUrl, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${session.access_token}`,
				"Accept": `${mimeType}, application/octet-stream, */*`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get("content-type") || "";

		// If response is JSON, try to extract content
		if (contentType.includes("application/json")) {
			const data = await response.json();
			
			// If response is already a data URL, return it directly
			if (typeof data === "string" && data.startsWith("data:")) {
				return data;
			}

			// If response is a base64 string
			if (typeof data === "string" && isBase64(data)) {
				return `data:${mimeType};base64,${data}`;
			}

			// If response is an object with content field
			if (data && typeof data === "object") {
				const content = data.content || data.data || data.base64;
				if (typeof content === "string") {
					if (content.startsWith("data:")) {
						return content;
					}
					if (isBase64(content)) {
						return `data:${mimeType};base64,${content}`;
					}
				}
				// Check if there's a URL in the response
				if (data.url) {
					return data.url;
				}
			}

			console.error("Sandbox image JSON response format not supported");
			return null;
		}

		// Response is raw binary - convert to data URL
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Error getting sandbox image:", error);
		return null;
	}
};

/**
 * Fetch sandbox 3D model (GLB/GLTF) as a Blob URL.
 * Uses native fetch to get binary data from the backend and creates
 * an Object URL that Three.js can load directly (same-origin, no CORS).
 *
 * Handles multiple response formats:
 * - Raw binary (when backend has glb/gltf in binary_extensions) -> blob directly
 * - JSON with url field (resource metadata) -> proxy through /api/proxy-model
 * - Text (corrupted binary as string) -> error
 */
export const getSandboxModelAsBlobUrl = async ({
	session,
	projectId,
	sandboxId,
	fileName,
}: {
	session: Session;
	projectId: string;
	sandboxId: string;
	fileName: string;
}): Promise<string | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/file/view/${projectId}/${sandboxId}`;
	const params = new URLSearchParams();
	params.append("is_sandbox_file", "true");
	params.append("file_name", fileName);
	const fullUrl = `${baseUrl}?${params.toString()}`;

	const ext = fileName.split(".").pop()?.toLowerCase() || "glb";
	const mimeType = ext === "gltf" ? "model/gltf+json" : "model/gltf-binary";

	try {
		const response = await fetch(fullUrl, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${session.access_token}`,
				"Accept": `${mimeType}, application/octet-stream, */*`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get("content-type") || "";

		// If the backend returns JSON (resource metadata with url field),
		// use the signed URL via the proxy instead
		if (contentType.includes("application/json")) {
			const data = await response.json();
			if (data && typeof data === "object" && data.url) {
				// Return the proxy URL so GLTFViewer routes it through /api/proxy-model
				return data.url;
			}
			console.error("Sandbox model: JSON response without url field", data);
			return null;
		}

		// If the response is text/plain, the binary was corrupted as text — 
		// this means glb/gltf is not in backend binary_extensions yet.
		if (contentType.includes("text/plain")) {
			console.error(
				"Sandbox model: received text/plain instead of binary. " +
				"Add 'glb'/'gltf' to binary_extensions in the backend."
			);
			return null;
		}

		// Raw binary response — use an ArrayBuffer for clean byte handling
		const arrayBuffer = await response.arrayBuffer();

		// Quick sanity check: GLB files start with magic bytes "glTF" (0x67 0x6C 0x54 0x46)
		if (ext === "glb" && arrayBuffer.byteLength >= 4) {
			const header = new Uint8Array(arrayBuffer, 0, 4);
			const magic = String.fromCharCode(...header);
			if (magic !== "glTF") {
				console.error("Sandbox model: binary data does not have valid GLB header, got:", magic);
				return null;
			}
		}

		const blob = new Blob([arrayBuffer], { type: mimeType });
		return URL.createObjectURL(blob);
	} catch (error) {
		console.error("Error getting sandbox 3D model:", error);
		return null;
	}
};

// Helper to check if a string looks like valid base64
function isBase64(str: string): boolean {
	if (!str || str.length < 20) return false;
	// Base64 should only contain these characters and possibly = padding
	const base64Regex = /^[A-Za-z0-9+/]+=*$/;
	// Check first 100 chars to avoid processing huge strings
	const sample = str.substring(0, 100).replace(/\s/g, "");
	return base64Regex.test(sample);
}

// WOPI Editor Response type
export type WopiEditorResponse = {
	editor_url: string;
	access_token: string;
	access_token_ttl: number;
	file_id: string;
	file_name: string;
};

/**
 * Get WOPI editor URL for editing sandbox files via Collabora Online
 * Uses the WOPI protocol for document editing
 */
export const getWopiSandboxEditorUrl = async({
	session,
	projectId,
	sandboxId,
	fileName,
}: {
	session: Session;
	projectId: string;
	sandboxId: string;
	fileName: string;
}) : Promise<WopiEditorResponse | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/wopi/editor/sandbox/${sandboxId}`;
	
	const params = new URLSearchParams();
	params.append("file_name", fileName);
	params.append("project_access_id", projectId);
	
	const fullUrl = `${baseUrl}?${params.toString()}`;

	try {
		const response = await axios.get<WopiEditorResponse>(fullUrl, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error getting WOPI sandbox editor URL:", error);
		return null;
	}
};

/**
 * Get WOPI editor URL for editing storage (GCS) files via Collabora Online
 * Uses the WOPI protocol for document editing
 */
export const getWopiStorageEditorUrl = async({
	session,
	projectId,
	resourceId,
}: {
	session: Session;
	projectId: string;
	resourceId: string;
}) : Promise<WopiEditorResponse | null> => {
	const baseUrl = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/wopi/editor/storage/${resourceId}`;
	
	const params = new URLSearchParams();
	params.append("project_access_id", projectId);
	
	const fullUrl = `${baseUrl}?${params.toString()}`;

	try {
		const response = await axios.get<WopiEditorResponse>(fullUrl, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error getting WOPI storage editor URL:", error);
		return null;
	}
};
