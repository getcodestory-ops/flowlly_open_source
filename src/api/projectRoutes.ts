import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import {
	ProjectEntity,
	CreateNewProjectEntity,
	ShareProjectEntity,
} from "@/types/projects";

export const getProjects = async(
	session: Session,
	project_type: string = "SCHEDULE",
): Promise<ProjectEntity[]> => {
	if (!session.access_token) return [];
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/projects`;
	try {
		const response = await axios.get(url, {
			params: { project_type },
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (response.data?.projects) {
			return response.data?.projects;
		} else {
			return [];
		}
	} catch (e) {
		//console.log(e);
		throw new Error("something went wrong");
	}
};

export const createProject = async(
	session: Session,
	project: CreateNewProjectEntity,
): Promise<ProjectEntity | null> => {
	if (!session.access_token) return null;
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project`;
	const response = await axios.post(url, project, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data?.project!;
};

export const shareProject = async(
	session: Session,
	project: ShareProjectEntity,
): Promise<ProjectEntity | null> => {
	if (!session.access_token) return null;
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project/share`;
	const response = await axios.post(url, project, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data?.project!;
};

export const deleteProject = async(session: Session, project_id: string) => {
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

export const syncScheduleProcore = async(
	session: Session,
	projectId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integrate/procore/sync_schedule/${projectId}`;

	const response = await axios.get(
		url,

		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const syncScheduleImpact = async(
	session: Session,
	projectId: string,
	impactDate: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/sync/procore/impact_update/${projectId}`;

	const response = await axios.get(url, {
		params: {
			impact_date: impactDate,
		},
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};
