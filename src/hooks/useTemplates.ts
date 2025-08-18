import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { 
	fetchProjectTemplates, 
	createProjectTemplate, 
	transformToTemplatePreview,
	type StorageResourceEntity,
	type CreateTemplateRequest,
	type TemplatePreview,
} from "@/api/templateRoutes";

/**
 * Hook to fetch project templates
 */
export const useProjectTemplates = (): UseQueryResult<StorageResourceEntity[], Error> => {
	const { session, activeProject } = useStore();

	return useQuery({
		queryKey: ["projectTemplates", activeProject?.project_id],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				throw new Error("No session or active project");
			}
			return fetchProjectTemplates(session, activeProject.project_id);
		},
		enabled: !!session && !!activeProject?.project_id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

/**
 * Hook to get template previews (transformed for UI)
 */
export const useTemplatesPreviews = (): {
	data: TemplatePreview[];
	templates: StorageResourceEntity[];
	isLoading: boolean;
	error: Error | null;
} => {
	const { data: templates, ...rest } = useProjectTemplates();

	const templatePreviews: TemplatePreview[] = templates 
		? templates.map(transformToTemplatePreview)
		: [];

	return {
		data: templatePreviews,
		templates: templates || [],
		...rest,
	};
};

/**
 * Hook to create a new template
 */
export const useCreateTemplate = (): UseMutationResult<StorageResourceEntity, Error, CreateTemplateRequest> => {
	const { session, activeProject } = useStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (templateRequest: CreateTemplateRequest) => {
			if (!session || !activeProject?.project_id) {
				throw new Error("No session or active project");
			}
			return createProjectTemplate(session, activeProject.project_id, templateRequest);
		},
		onSuccess: () => {
			// Invalidate and refetch templates
			queryClient.invalidateQueries({
				queryKey: ["projectTemplates", activeProject?.project_id],
			});
		},
	});
};

/**
 * Hook to get templates by use case
 */
export const useTemplatesByUseCase = (): {
	data: Record<string, TemplatePreview[]>;
	templates: StorageResourceEntity[];
	isLoading: boolean;
	error: Error | null;
} => {
	const { data: templates, ...rest } = useProjectTemplates();

	const templatesByUseCase = templates?.reduce((acc: Record<string, TemplatePreview[]>, template: StorageResourceEntity) => {
		const useCase = template.metadata.use_case || "general";
		if (!acc[useCase]) {
			acc[useCase] = [];
		}
		acc[useCase].push(transformToTemplatePreview(template));
		return acc;
	}, {} as Record<string, TemplatePreview[]>) || {};

	return {
		data: templatesByUseCase,
		templates: templates || [],
		...rest,
	};
};

/**
 * Hook to get a specific template by ID
 */
export const useTemplate = (templateId: string | null): {
	data: StorageResourceEntity | null;
	isLoading: boolean;
} => {
	const { data: templates } = useProjectTemplates();

	const template = templates?.find((t: StorageResourceEntity) => t.id === templateId) || null;

	return {
		data: template,
		isLoading: !templates && !!templateId,
	};
};
