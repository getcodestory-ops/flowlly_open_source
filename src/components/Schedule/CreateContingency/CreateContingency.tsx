import { Button, useToast } from "@chakra-ui/react";
import { createContingencyPlan } from "@/api/analysis_routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";

const CreateContingency = () => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const session = useStore((state) => state.session);
	const selectedContext = useStore((state) => state.selectedContext);
	const activeProject = useStore((state) => state.activeProject);

	const { mutate, isPending, data } = useMutation({
		mutationFn: () => {
			if (!session || !activeProject) {
				return Promise.reject("no session or context or project");
			}
			return createContingencyPlan(session, activeProject.project_id);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["agentChats"] });
			toast({
				title: "Success",
				description: `${data.agent_response}`,
				status: "success",
				duration: 4000,
				isClosable: true,
				position: "bottom-right",
			});
		},
	});

	return (
		<Button
			background="black"
			color="white"
			onClick={() => mutate()}
			size="xs"
			variant="solid"
		>
      Create Contingency Plan
		</Button>
	);
};

export default CreateContingency;
