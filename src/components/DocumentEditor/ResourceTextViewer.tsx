import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";

export function ResourceTextViewer({ resource_id }: { resource_id: string }) {
	const activeProject = useStore((state) => state.activeProject);
	const session = useStore((state) => state.session);
	const { onSubmit, isPending } = useStorageTextFileSave(resource_id);

	const { data, isLoading, error } = useQuery({
		queryKey: ["aiJobResource", resource_id],
		queryFn: () =>
			fetchResource(session, activeProject?.project_id, resource_id),
	});

	return (
		<div>
			{isLoading && <div>Loading...</div>}
			{data && (
				<div>
					<ContentEditor
						content={data.metadata?.content}
						documentId={resource_id}
						saveFunction={onSubmit}
					/>
				</div>
			)}
		</div>
	);
}
