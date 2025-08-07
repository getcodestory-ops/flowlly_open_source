"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getApiIntegration,
	registerOutlookCalendarWebhook,
	registerOutlookMailWebhook,
	getMicrosoftWebhook,
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
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Integration(): React.ReactNode {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [procoreConnected, setProcoreConnected] = useState(false);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const [microsoftWebhook, setMicrosoftWebhook] = useState(null);
	const [microsoftMailWebhook, setMicrosoftMailWebhook] = useState(null);

	const { data: microsoftIntegration } = useQuery({
		queryKey: ["integration", activeProject?.project_id, "microsoft"],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, "microsoft"),
		enabled: !!session && !!activeProject?.project_id,
	});

	const { data: procoreIntegration } = useQuery({
		queryKey: ["integration", activeProject?.project_id, "procore"],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, "procore"),
		enabled: !!session && !!activeProject?.project_id,
	});

	useEffect(() => {
		setMicrosoftConnected(!!microsoftIntegration);
	}, [microsoftIntegration]);

	useEffect(() => {
		setProcoreConnected(!!procoreIntegration);
	}, [procoreIntegration]);

	const { data: microsoftWebhookState } = useQuery({
		queryKey: ["microsoftWebhook", activeProject?.project_id],
		queryFn: () =>
			getMicrosoftWebhook(session!, activeProject?.project_id!, "events"),
		enabled: !!session && !!activeProject?.project_id,
	});

	const { data: microsoftMailWebhookState } = useQuery({
		queryKey: ["microsoftMailWebhook", activeProject?.project_id],
		queryFn: () =>
			getMicrosoftWebhook(session!, activeProject?.project_id!, "messages"),
		enabled: !!session && !!activeProject?.project_id,
	});

	useEffect(() => {
		setMicrosoftWebhook(microsoftWebhookState);
	}, [microsoftWebhookState]);

	useEffect(() => {
		setMicrosoftMailWebhook(microsoftMailWebhookState);
		//console.log("microsoftMailWebhookState", microsoftMailWebhookState);
	}, [microsoftMailWebhookState]);

	const {
		mutate: registerOutlookCalendarWebhookMutation,
		isPending,
		isSuccess,
	} = useMutation({
		mutationFn: () =>
			registerOutlookCalendarWebhook(session!, activeProject?.project_id!),
		onSuccess: () => {
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
		onSuccess: () => {
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
				client_id: "5f3afbcd-94ce-4a50-9721-79136b5d4c1e",
				response_type: "code",
				redirect_uri:
          "https://prod.api.flowlly.com/microsoft/integration",
				response_mode: "query",
				scope:
          "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite ",
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
											<Badge className="text-green-700 border-green-200" variant="outline">
												Connected
											</Badge>
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
									<div className="flex items-center justify-between py-2">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-gray-500" />
											<span className="text-sm font-medium">Outlook Mail</span>
										</div>
										{microsoftMailWebhook || isSuccessMail ? (
											<Badge className="text-green-700 border-green-200" variant="outline">
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
