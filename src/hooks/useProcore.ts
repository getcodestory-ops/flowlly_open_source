import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProcoreProjects } from "@/api/integration_routes";
import { type Session } from "@supabase/supabase-js";

export const useProcoreProjects = (
	session: Session | null,
	project_access_id?: string,
) => {
	const { data, isLoading } = useQuery({
		queryKey: ["procore-projects", session, project_access_id],
		queryFn: () => getProcoreProjects(session!, project_access_id!),
		enabled: !!session && !!project_access_id,
	});
	return { projects: data ?? [], loading: isLoading };
};
