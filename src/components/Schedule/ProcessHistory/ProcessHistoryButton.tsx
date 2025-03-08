import { Button, useToast, Tooltip, Icon } from "@chakra-ui/react";
import { processMessageHistory } from "@/api/analysis_routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { TbAnalyzeFilled } from "react-icons/tb";

const ProcessHistoryButton = () => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const session = useStore((state) => state.session);
	const selectedContext = useStore((state) => state.selectedContext);
	const activeProject = useStore((state) => state.activeProject);

	const { mutate, isPending, data } = useMutation({
		mutationFn: () => {
			if (!session || !activeProject) {
				//console.log("no session or project");
				return Promise.reject("no session or context or project");
			}
			return processMessageHistory(session, activeProject.project_id);
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
	// <Button
	//   variant="solid"
	//   size={"xs"}
	//   background={"black"}
	//   color="white"
	//   onClick={() => mutate()}
	// >
	//   Process History
	// </Button>
		<Tooltip
			aria-label="A tooltip"
			bg="white"
			color="brand.dark"
			label="Process Latest Updates"
		>
			<Button
				_hover={{ bg: "brand.dark", color: "white" }}
				bg="white"
				className="custom-shadow"
				cursor="pointer"
				mx="2"
				onClick={() => mutate()}
				p="0"
				rounded="full"
				size="xs"
			>
				<Icon
					_hover={{
						transform: "rotate(360deg)",

						transition: "transform 0.5s ease-in-out",
					}}
					as={TbAnalyzeFilled}
					boxSize="4"
				/>
			</Button>
		</Tooltip>
	);
};

export default ProcessHistoryButton;
