import { useQuery } from "@tanstack/react-query";
import { getNodeTraces } from "@/api/update_routes";
import type { Session } from "@supabase/supabase-js";
import { useStore } from "@/utils/store";

export const useDocumentTracer = (nodeId: string) => {
	const { activeProject } = useStore((state) => ({
		activeProject: state.activeProject,
	}));
	const { session } = useStore((state) => ({
		session: state.session,
	}));

	const { data: traces } = useQuery({
		queryKey: ["traces", activeProject, nodeId, session],
		queryFn: () => {
			if (!activeProject || !session) {
				return null;
			}
			return getNodeTraces(session, activeProject.project_id, nodeId);
		},
	});

	return traces;
};
