"use client";

import { useState, useEffect } from "react";
import {
	registerOutlookCalendarWebhook,
	registerOutlookMailWebhook,
	deleteCalendarWebhook,
	deleteMicrosoftIntegration,
} from "@/api/integration_routes";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Settings, Calendar, Mail } from "lucide-react";
import { useStore } from "@/utils/store";
import { useIntegrationStore } from "@/hooks/useIntegrationStore";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Integration(): React.ReactNode {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	
	// Use integration store
	const microsoftIntegration = useIntegrationStore((state) => state.microsoftIntegration);
	const procoreIntegration = useIntegrationStore((state) => state.procoreIntegration);
	const microsoftCalendarWebhook = useIntegrationStore((state) => state.microsoftCalendarWebhook);
	const microsoftMailWebhook = useIntegrationStore((state) => state.microsoftMailWebhook);
	const fetchMicrosoftCalendarWebhook = useIntegrationStore((state) => state.fetchMicrosoftCalendarWebhook);
	const fetchMicrosoftMailWebhook = useIntegrationStore((state) => state.fetchMicrosoftMailWebhook);
	const setMicrosoftCalendarWebhook = useIntegrationStore((state) => state.setMicrosoftCalendarWebhook);
	const setMicrosoftMailWebhook = useIntegrationStore((state) => state.setMicrosoftMailWebhook);
	const setMicrosoftIntegration = useIntegrationStore((state) => state.setMicrosoftIntegration);
	
	const [procoreConnected, setProcoreConnected] = useState(false);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const [microsoftWebhook, setMicrosoftWebhook] = useState<typeof microsoftCalendarWebhook>(null);
	const [localMicrosoftMailWebhook, setLocalMicrosoftMailWebhook] = useState<typeof microsoftMailWebhook>(null);

	useEffect(() => {
		setMicrosoftConnected(!!microsoftIntegration);
	}, [microsoftIntegration]);

	useEffect(() => {
		setProcoreConnected(!!procoreIntegration);
	}, [procoreIntegration]);

	useEffect(() => {
		setMicrosoftWebhook(microsoftCalendarWebhook);
	}, [microsoftCalendarWebhook]);

	useEffect(() => {
		setLocalMicrosoftMailWebhook(microsoftMailWebhook);
	}, [microsoftMailWebhook]);

	const {
		mutate: registerOutlookCalendarWebhookMutation,
		isPending,
		isSuccess,
	} = useMutation({
		mutationFn: () =>
			registerOutlookCalendarWebhook(session!, activeProject?.project_id!),
		onSuccess: async() => {
			// Refresh webhook state in store
			if (session && activeProject?.project_id) {
				await fetchMicrosoftCalendarWebhook(session, activeProject.project_id);
			}
			toast({
				title: "Webhook registered successfully",
				description: "Your Outlook calendar is now connected to Flowlly",
			});
		},
		onError: () => {
			toast({
				title: "Failed to register webhook",
				description: "Please try again",
			});
		},
	});

	const {
		mutate: registerOutlookMailWebhookMutation,
		isPending: isPendingMail,
		isSuccess: isSuccessMail,
	} = useMutation({
		mutationFn: () =>
			registerOutlookMailWebhook(session!, activeProject?.project_id!),
		onSuccess: async() => {
			// Refresh webhook state in store
			if (session && activeProject?.project_id) {
				await fetchMicrosoftMailWebhook(session, activeProject.project_id);
			}
			toast({
				title: "Webhook registered successfully",
				description: "Your Outlook mail is now connected to Flowlly",
			});
		},
		onError: () => {
			toast({
				title: "Failed to register webhook",
				description: "Please try again",
			});
		},
	});

	const {
		mutate: deleteCalendarWebhookMutation,
		isPending: isPendingDelete,
	} = useMutation({
		mutationFn: () =>
			deleteCalendarWebhook(
				session!,
				activeProject?.project_id!,
				microsoftCalendarWebhook?.subscription_id ?? "",
			),
		onSuccess: () => {
			setMicrosoftWebhook(null);
			setMicrosoftCalendarWebhook(null);
			toast({
				title: "Calendar disconnected",
				description: "Your Outlook calendar has been disconnected",
			});
		},
		onError: () => {
			toast({
				title: "Failed to disconnect calendar",
				description: "Please try again",
			});
		},
	});

	const {
		mutate: deleteMicrosoftIntegrationMutation,
		isPending: isPendingDeleteIntegration,
	} = useMutation({
		mutationFn: () =>
			deleteMicrosoftIntegration(session!, activeProject?.project_id!),
		onSuccess: () => {
			// Clear all Microsoft-related state in store
			setMicrosoftIntegration(null);
			setMicrosoftCalendarWebhook(null);
			setMicrosoftMailWebhook(null);
			setMicrosoftConnected(false);
			setMicrosoftWebhook(null);
			setLocalMicrosoftMailWebhook(null);
			toast({
				title: "Microsoft integration removed",
				description: "All Microsoft 365 services have been disconnected",
			});
		},
		onError: () => {
			toast({
				title: "Failed to remove integration",
				description: "Please try again",
			});
		},
	});

	const handleProcoreConnect = (): void => {
		//console.log("procoreConnected", procoreConnected);
		if (!procoreConnected) {
			if (!session || !activeProject) {
				toast({
					title: "Error",
					description: "Either session or project is not valid!",
					duration: 4000,
				});
				return;
			}
			//here new things

			const clientId = process.env.NEXT_PUBLIC_PROCORE_CLIENT_ID;
			const redirectUri = process.env.NEXT_PUBLIC_PROCORE_REDIRECT_URI;
			const state = activeProject.project_id;
			const baseUri = process.env.NEXT_PUBLIC_PROCORE_BASE_URI;

			const authUrl = `${baseUri}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
			window.location.href = authUrl;
		} else {
			// Handle disconnect logic here
			setProcoreConnected(false);
			toast({
				title: "Disconnected",
				description: "Successfully disconnected from Procore",
				duration: 4000,
			});
		}
	};

	const handleMicrosoftConnect = async(): Promise<void> => {
		if (!microsoftConnected) {
			const sessionToken = session?.access_token;
			const userId = session?.user?.id;
			const projectId = activeProject?.project_id;
			if (!sessionToken || !userId || !projectId) {
				return;
			}
			// Redirect to Microsoft OAuth login with specific scopes for Excel
			const params = new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_GRAPH_CLIENT_ID ?? "",
				response_type: "code",
				redirect_uri: process.env.NEXT_PUBLIC_GRAPH_REDIRECT_URI ?? "",
				response_mode: "query",
				scope:
          "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite Mail.Read Mail.ReadWrite Mail.Send email User.Read",
				state: sessionToken + "___" + userId + "___" + projectId,
			});

			const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
			window.location.href = authUrl;
		} else {
			try {
				await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/disconnect`,
					{
						method: "POST",
						credentials: "include",
					},
				);
				setMicrosoftConnected(false);
			} catch (error) {
				console.error("Failed to disconnect:", error);
			}
		}
	};



	return (
		<div className="container h-full overflow-auto">
			<Toaster />
			<div className="p-6 h-full max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-8">
					<h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
					<p className="text-gray-600 mt-1">Connect your tools to streamline your workflow</p>
				</div>
				{/* Integration Cards */}
				<div className="space-y-6">
					{/* Procore Integration */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5 text-gray-600" />
										Procore
									</CardTitle>
									<CardDescription>
										Construction management platform
									</CardDescription>
								</div>
								{procoreConnected ? (
									<Badge className="text-green-700 border-green-200" variant="outline">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										Connected
									</Badge>
								) : (
									<Badge variant="secondary">Not Connected</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{procoreConnected ? (
								<div className="text-sm text-gray-600">
									Your Procore account is connected and syncing schedules, projects, and reports.
								</div>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-gray-600">
										Connect to sync your construction data with Procore.
									</p>
									<Button onClick={handleProcoreConnect}>
										Connect to Procore
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
					{/* Microsoft Integration */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5 text-gray-600" />
										Microsoft 365
									</CardTitle>
									<CardDescription>
										Outlook Calendar & Email integration
									</CardDescription>
								</div>
								{microsoftConnected ? (
									<Badge className="text-green-700 border-green-200" variant="outline">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										Connected
									</Badge>
								) : (
									<Badge variant="secondary">Not Connected</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{microsoftConnected ? (
								<div className="space-y-4">
									<div className="text-sm text-gray-600 mb-4">
										Your Microsoft 365 account is connected. Configure specific services below:
									</div>
									<div className="flex items-center justify-between py-2 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-500" />
											<span className="text-sm font-medium">Outlook Calendar</span>
										</div>
										{microsoftWebhook || isSuccess ? (
											<div className="flex items-center gap-2">
												<Badge className="text-green-700 border-green-200" variant="outline">
													<CheckCircle2 className="h-3 w-3 mr-1" />
													Connected
												</Badge>
												<Button
													disabled={isPendingDelete}
													onClick={() => deleteCalendarWebhookMutation()}
													size="sm"
													variant="outline"
												>
													{isPendingDelete ? (
														<>
															<Loader2 className="h-3 w-3 mr-1 animate-spin" />
															Disconnecting...
														</>
													) : (
														"Disconnect"
													)}
												</Button>
											</div>
										) : (
											<Button
												disabled={isPending}
												onClick={() => registerOutlookCalendarWebhookMutation()}
												size="sm"
												variant="outline"
											>
												{isPending ? (
													<>
														<Loader2 className="h-3 w-3 mr-1 animate-spin" />
														Connecting...
													</>
												) : (
													"Connect"
												)}
											</Button>
										)}
									</div>
									{/* Email Service */}
									<div className="flex items-center justify-between py-2 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-gray-500" />
											<span className="text-sm font-medium">Outlook Mail</span>
										</div>
										{localMicrosoftMailWebhook || isSuccessMail ? (
											<Badge className="text-green-700 border-green-200" variant="outline">
												<CheckCircle2 className="h-3 w-3 mr-1" />
												Connected
											</Badge>
										) : (
											<Button
												disabled={isPendingMail}
												onClick={() => registerOutlookMailWebhookMutation()}
												size="sm"
												variant="outline"
											>
												{isPendingMail ? "Connecting..." : "Connect"}
											</Button>
										)}
									</div>
									{/* Disconnect entire integration */}
									<div className="pt-4 mt-4 border-t border-gray-200">
										<Button
											disabled={isPendingDeleteIntegration}
											onClick={() => deleteMicrosoftIntegrationMutation()}
											size="sm"
											variant="destructive"
										>
											{isPendingDeleteIntegration ? (
												<>
													<Loader2 className="h-3 w-3 mr-1 animate-spin" />
													Removing Integration...
												</>
											) : (
												"Remove Microsoft 365 Integration"
											)}
										</Button>
										<p className="text-xs text-gray-500 mt-2">
											This will disconnect all Microsoft services and remove all webhooks
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-gray-600">
										Connect to sync your calendar events and email communications.
									</p>
									<Button onClick={handleMicrosoftConnect}>
										Connect to Microsoft 365
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
