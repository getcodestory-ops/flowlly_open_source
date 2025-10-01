import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Loader2, CheckCircle2, ChevronDown, Download, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import ImportMeetingsDialog from "./ImportMeetingsDialog";
import CalendarConnectionSuccessDialog from "./CalendarConnectionSuccessDialog";
import { useStore } from "@/utils/store";
import { useIntegrationStore, type WebhookData } from "@/hooks/useIntegrationStore";
import {
	registerOutlookCalendarWebhook,
} from "@/api/integration_routes";

function CreateJob(): React.ReactNode {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	
	// Use integration store
	const microsoftIntegration = useIntegrationStore((state) => state.microsoftIntegration);
	const microsoftCalendarWebhook = useIntegrationStore((state) => state.microsoftCalendarWebhook);
	const fetchMicrosoftIntegration = useIntegrationStore((state) => state.fetchMicrosoftIntegration);
	const fetchMicrosoftCalendarWebhook = useIntegrationStore((state) => state.fetchMicrosoftCalendarWebhook);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const [microsoftWebhook, setMicrosoftWebhook] = useState<WebhookData | null>(null);
	const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
	const [connectionPolling, setConnectionPolling] = useState<NodeJS.Timeout | null>(null);

	// Calendar webhook registration mutation
	const {
		mutate: registerCalendarWebhook,
		isPending: isCalendarRegistering,
	} = useMutation({
		mutationFn: () =>
			registerOutlookCalendarWebhook(session!, activeProject?.project_id!),
		onSuccess: async() => {
			setIsConnectingCalendar(false);
			// Small delay to ensure backend has processed the webhook
			setTimeout(async() => {
				// Refetch webhook state to update UI
				if (session && activeProject?.project_id) {
					await fetchMicrosoftCalendarWebhook(session, activeProject.project_id);
				}
				// Show success dialog after UI is updated
				setIsSuccessDialogOpen(true);
			}, 500);
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
			
			// Automatically trigger calendar connection with better feedback
			toast({
				title: "Microsoft Connected!",
				description: "Setting up calendar integration...",
			});
			
			// Trigger calendar webhook registration
			registerCalendarWebhook();
		}
	}, [microsoftIntegration, microsoftConnected, isConnectingCalendar, connectionPolling, toast, registerCalendarWebhook]);

	useEffect(() => {
		setMicrosoftWebhook(microsoftCalendarWebhook);
	}, [microsoftCalendarWebhook]);

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
			if (session && activeProject?.project_id) {
				fetchMicrosoftIntegration(session, activeProject.project_id);
			}
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
				client_id: process.env.NEXT_PUBLIC_GRAPH_CLIENT_ID ?? "",
				response_type: "code",
				redirect_uri: process.env.NEXT_PUBLIC_GRAPH_REDIRECT_URI ?? "",
				response_mode: "query",
				scope: "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite Mail.Read Mail.ReadWrite Mail.Send email User.Read",
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

	const handleImportMeetings = (): void => {
		if (!microsoftWebhook) {
			toast({
				title: "Calendar Not Connected",
				description: "Please connect your Microsoft calendar first.",
				variant: "destructive",
			});
			return;
		}
		setIsImportDialogOpen(true);
	};

	const handleSuccessDialogImport = (): void => {
		setIsImportDialogOpen(true);
	};

	const handleSuccessDialogSkip = (): void => {
		// Just close the dialog, user can access import later from dropdown
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
			{/* Microsoft Calendar Integration */}
			{!microsoftWebhook ? (
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
					) : (
						<>
							<Calendar className="h-4 w-4" />
							Connect Microsoft Calendar
						</>
					)}
				</Button>
			) : (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="flex items-center gap-2" variant="outline">
							<CheckCircle2 className="h-4 w-4 text-green-500" />
							Calendar Connected
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuItem onClick={handleImportMeetings}>
							<Download className="mr-2 h-4 w-4" />
							Import Meetings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleCalendarSetup}>
							<Settings className="mr-2 h-4 w-4" />
							Reconnect Calendar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			{/* Meeting Creation Sheet */}
			<Sheet onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				
				<SheetContent className="w-[50vw]"
					side="right"
				>
					<SheetTitle>Create New Meeting</SheetTitle>
					<ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />
				</SheetContent>
			</Sheet>
			{/* Import Meetings Dialog */}
			<ImportMeetingsDialog 
				isOpen={isImportDialogOpen} 
				onClose={() => setIsImportDialogOpen(false)} 
			/>
			{/* Calendar Connection Success Dialog */}
			<CalendarConnectionSuccessDialog
				isOpen={isSuccessDialogOpen}
				onClose={() => setIsSuccessDialogOpen(false)}
				onImportMeetings={handleSuccessDialogImport}
				onSkip={handleSuccessDialogSkip}
			/>
		</div>
	);
}

export default CreateJob;
