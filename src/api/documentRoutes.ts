import { DocumentEntity, StorageEntity } from "@/types/document";
import { type Session } from "@supabase/supabase-js";
import axios from "axios";

export const createDocument = async(
	session: Session,
	projectId: string,
	title: string,
	activityId?: string,
	brainId?: string,
) => {
	if (!session.access_token) return null;
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/${projectId}`;
	const data = {
		title: title,
		project_access_id: projectId,
		activity_id: activityId,
		brain_id: brainId,
	};
	try {
		const response = await axios.post(url, data, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const getDocuments = async(
	session: Session,
	projectId: string,
	activityId?: string,
	brainId?: string,
): Promise<DocumentEntity[]> => {
	const query = {
		activity_id: activityId,
		brain_id: brainId,
	};
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/${projectId}`;

	const response = await axios.get(url, {
		params: query,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getcontainerEntities = async(
	session: Session,
	projectId: string,
	type_of: string,
): Promise<StorageEntity[]> => {
	const query = {
		type_of: type_of,
	};
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/container/${projectId}`;

	const response = await axios.get(url, {
		params: query,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getDocumentContent = async(
	session: Session,
	documentId: string,
	projectId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/content/${documentId}`;

	const response = await axios.get(url, {
		params: {
			project_access_id: projectId,
		},
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const syncDocumentProcore = async(
	session: Session,
	projectId: string,
	documentId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/sync/procore`;

	const response = await axios.get(
		url,

		{
			params: {
				document_id: documentId,
				project_access_id: projectId,
			},
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const updateDocumentContent = async(
	session: Session,
	documentId: string,
	data: any,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/content/${documentId}`;

	const response = await axios.put(
		url,
		{ blocks: data },
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export async function uploadMP3File(
	session: Session,
	documentId: string,
	projectId: string,
	file: File,
) {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/content/mp3/${documentId}`;

	const formData = new FormData();
	formData.append("file", file);
	formData.append("document_id", documentId);
	formData.append("project_access_id", projectId);

	const response = await axios.post(url, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
}

export const updateStorageTextDocument = async(
	session: Session,
	projectId: string,
	resourceId: string,
	contentData: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/document/${projectId}`;

	const response = await axios.put(
		url,
		{
			resource_id: resourceId,
			content: {  content: contentData },
		},
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};


export const updateDocumentName = async(
	session: Session,
	documentId: string,
	newName: string,
) : Promise<{message: string} | undefined> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/document/${documentId}`;
	try {
		const response = await axios.put(url, {
			title: newName,
		}, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error(error);
		return 	;
	}
};


