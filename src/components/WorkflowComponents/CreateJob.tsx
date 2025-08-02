import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Loader2, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import { useStore } from "@/utils/store";
import {
	getApiIntegration,
	registerOutlookCalendarWebhook,
	getMicrosoftWebhook,
} from "@/api/integration_routes";

function CreateJob(): React.ReactNode {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const [microsoftWebhook, setMicrosoftWebhook] = useState(null);
	const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
	const [connectionPolling, setConnectionPolling] = useState<NodeJS.Timeout | null>(null);

	// Check Microsoft integration status
	const { data: microsoftIntegration, refetch: refetchMicrosoftIntegration } = useQuery({
		queryKey: ["integration", activeProject?.project_id, "microsoft"],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, "microsoft"),
		enabled: !!session && !!activeProject?.project_id,
	});

	// Check calendar webhook status
	const { data: microsoftWebhookState } = useQuery({
		queryKey: ["microsoftWebhook", activeProject?.project_id],
		queryFn: () =>
			getMicrosoftWebhook(session!, activeProject?.project_id!, "events"),
		enabled: !!session && !!activeProject?.project_id && microsoftConnected,
	});

	// Calendar webhook registration mutation
	const {
		mutate: registerCalendarWebhook,
		isPending: isCalendarRegistering,
	} = useMutation({
		mutationFn: () =>
			registerOutlookCalendarWebhook(session!, activeProject?.project_id!),
		onSuccess: () => {
			setIsConnectingCalendar(false);
			toast({
				title: "Calendar Ready!",
				description: "Your Microsoft calendar is now connected and ready to sync.",
			});
		},
		onError: () => {
			setIsConnectingCalendar(false);
			toast({
				title: "Connection Failed",
				description: "Failed to connect calendar. Please try again.",
				variant: "destructive",
			});
		},
	});

	useEffect(() => {
		const wasConnected = microsoftConnected;
		setMicrosoftConnected(!!microsoftIntegration);
		
		// If Microsoft gets connected while polling, automatically connect calendar
		if (microsoftIntegration && !wasConnected && isConnectingCalendar) {
			if (connectionPolling) {
				clearInterval(connectionPolling);
				setConnectionPolling(null);
			}
			
			// Automatically trigger calendar connection
			toast({
				title: "Microsoft Connected!",
				description: "Now connecting your calendar...",
			});
			
			// Trigger calendar webhook registration
			registerCalendarWebhook();
		}
	}, [microsoftIntegration, microsoftConnected, isConnectingCalendar, connectionPolling, toast, registerCalendarWebhook]);

	useEffect(() => {
		setMicrosoftWebhook(microsoftWebhookState);
	}, [microsoftWebhookState]);

	// Cleanup polling on unmount
	useEffect(() => {
		return () => {
			if (connectionPolling) {
				clearInterval(connectionPolling);
			}
		};
	}, [connectionPolling]);

	const startConnectionPolling = (): void => {
		// Clear any existing polling
		if (connectionPolling) {
			clearInterval(connectionPolling);
		}

		// Start polling every 3 seconds to check for connection
		const polling = setInterval(() => {
			refetchMicrosoftIntegration();
		}, 3000);

		setConnectionPolling(polling);

		// Auto-stop polling after 5 minutes to prevent infinite polling
		setTimeout(() => {
			if (polling) {
				clearInterval(polling);
				setConnectionPolling(null);
				setIsConnectingCalendar(false);
				toast({
					title: "Connection Timeout",
					description: "Please try connecting again if the process didn't complete.",
					variant: "destructive",
				});
			}
		}, 300000); // 5 minutes
	};

	const handleCalendarSetup = async(): Promise<void> => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "Session or project not found",
				variant: "destructive",
			});
			return;
		}

		// If already connected, just register webhook
		if (microsoftConnected && !microsoftWebhook) {
			registerCalendarWebhook();
			return;
		}

		// If not connected, start full OAuth flow
		if (!microsoftConnected) {
			const sessionToken = session?.access_token;
			const userId = session?.user?.id;
			const projectId = activeProject?.project_id;

			if (!sessionToken || !userId || !projectId) {
				return;
			}

			// Open Microsoft OAuth in new tab
			const params = new URLSearchParams({
				client_id: "5f3afbcd-94ce-4a50-9721-79136b5d4c1e",
				response_type: "code",
				redirect_uri: "https://flowlly.eastus.cloudapp.azure.com/microsoft/integration",
				response_mode: "query",
				scope: "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite ",
				state: sessionToken + "___" + userId + "___" + projectId,
			});

			const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
			
			// Open in new tab
			const authWindow = window.open(authUrl, "_blank", "width=600,height=700,scrollbars=yes,resizable=yes");
			
			if (authWindow) {
				setIsConnectingCalendar(true);
				startConnectionPolling();
				
				toast({
					title: "Setting up Microsoft Calendar",
					description: "Complete the login in the new tab. We'll automatically set up your calendar.",
				});

				// Focus the auth window
				authWindow.focus();
			} else {
				toast({
					title: "Popup Blocked",
					description: "Please allow popups and try again.",
					variant: "destructive",
				});
			}
		}
	};



	return (
		<div className="flex gap-3 items-center">
			{/* Create New Meeting Button */}
			<Button 
				className="bg-indigo-500 hover:bg-indigo-600 text-white"
				onClick={() => setIsDialogOpen(true)}
			>
				<Video className="mr-2 h-4 w-4" />
				Create New Meeting
			</Button>
			{/* Microsoft Calendar Setup Button */}
			<Button
				className="flex items-center gap-2"
				disabled={isConnectingCalendar || isCalendarRegistering}
				onClick={handleCalendarSetup}
				variant="outline"
			>
				{(isConnectingCalendar || isCalendarRegistering) ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Setting up calendar...
					</>
				) : microsoftWebhook ? (
					<>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
						Calendar Connected
					</>
				) : (
					<>
						<Calendar className="h-4 w-4" />
						Connect Microsoft Calendar
					</>
				)}
			</Button>
			{/* Meeting Creation Sheet */}
			<Sheet onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<SheetContent className="w-[50vw]" side="right">
					<ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />
				</SheetContent>
			</Sheet>
		</div>
	);
}

export default CreateJob;
