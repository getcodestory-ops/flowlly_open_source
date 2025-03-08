import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewProjectEvent } from "@/api/taskQueue";
import { WorkflowFormData } from "../types";
import { CreateEvent, IdentificationType } from "@/types/projectEvents";
import { useToast } from "@/components/ui/use-toast";
interface UseWorkflowFormProps {
  session: any;
  activeProject: any;
  members: any[];
  editData: any;
}

export function useWorkflowForm({
	session,
	activeProject,
	members,
	editData,
}: UseWorkflowFormProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<WorkflowFormData>({
		name: "",
		workflowFor: "",
		recurrence: "manual",
		startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		accessBy: "project_access",
		accessByKey: "",
		triggerBy: "phone",
		triggerKeyword: "",
		triggerByKey: "",
		authorizedUsers: [],
		nodes: [],
		startDate: format(new Date(), "yyyy-MM-dd"),
		endDate: format(new Date(), "yyyy-MM-dd"),
		recurrenceDay: format(new Date(), "EEEE"),
	});

	const [isFormValid, setIsFormValid] = useState(false);

	useEffect(() => {
		validateForm();
	}, [formData]);

	const validateForm = () => {
		switch (currentStep) {
			case 0:
				setIsFormValid(!!formData.name && !!formData.startTime);
				break;
			case 1:
				setIsFormValid(validateTriggerStep());
				break;
			case 2:
				setIsFormValid(formData.nodes.length > 0);
				break;
			default:
				setIsFormValid(false);
		}
	};

	const validateTriggerStep = () => {
		if (formData.triggerBy === "phone" && formData.accessBy === "any") {
			return true;
		}
		return true;
	};

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: (createEvent: CreateEvent) => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("Session or active project not available");
			}
			return createNewProjectEvent({
				session,
				projectId: activeProject?.project_id,
				projectEvent: createEvent,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
			toast({
				title: "Workflow created successfully",
				description: "You can now start the workflow",
			});
		},
	});

	const handleNext = () => {
		//console.log("isFormValid", isFormValid);
		if (currentStep < 2 && isFormValid) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const updateFormData = (updates: Partial<WorkflowFormData>) => {
		setFormData((prev) => {
			const newFormData = { ...prev, ...updates };
			return newFormData;
		});
	};

	const handleSubmit = async(event: React.FormEvent) => {
		event.preventDefault();
		if (!session || !activeProject) return;

		const createEvent: CreateEvent = {
			id: formData.id,
			project_event: {
				name: formData.name,
				event_type: "custom",
				metadata: {
					nodes: formData.nodes,
					frequency: formData.recurrence,
					recurrence_day: formData.recurrenceDay,
					time: format(new Date(formData.startTime), "HH:mm"),
					triggerType: "ui",
				},
			},
			event_participants: [
				...formData.authorizedUsers.map((userId) => ({
					role: "owner" as const,
					identification: "user_id" as IdentificationType,
					metadata: { user_id: userId },
				})),
			],
			event_trigger: {
				access_by: formData.accessBy,
				access_key: formData.accessByKey,
				trigger_by: formData.triggerBy,
				trigger_keyword: formData.triggerKeyword,
				metadata: {},
				trigger_by_key: formData.triggerByKey,
			},
			start_time: format(new Date(formData.startTime), "HH:mm"),
			start_date: formData.startDate
				? format(new Date(formData.startDate), "yyyy-MM-dd")
				: undefined,
			recurrence: formData.recurrence,
			time_zone: formData.timeZone,
			join_now: true,
			end_date: formData.endDate
				? format(new Date(formData.endDate), "yyyy-MM-dd")
				: undefined,
		};

		try {
			//console.log("createEvent", createEvent);
			mutate(createEvent);
		} catch (error) {
			console.error("Error creating workflow:", error);
		}
	};

	return {
		currentStep,
		formData,
		isFormValid,
		handleNext,
		handleBack,
		handleSubmit,
		updateFormData,
		isPending,
		isSuccess,
	};
}
