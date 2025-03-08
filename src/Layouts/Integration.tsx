"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getApiIntegration,
	registerOutlookCalendarWebhook,
	registerOutlookMailWebhook,
	getMicrosoftWebhook,
	getMicrosoftMailWebhook,
} from "@/api/integration_routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useStore } from "@/utils/store";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Integration() {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [procoreConnected, setProcoreConnected] = useState(false);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const [syncProjects, setSyncProjects] = useState(false);
	const [syncInterval, setSyncInterval] = useState("60");
	const [googleConnected, setGoogleConnected] = useState(false);
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

	const handleProcoreConnect = () => {
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

	const handleMicrosoftConnect = async() => {
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
          "https://flowlly.eastus.cloudapp.azure.com/microsoft/integration",
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

	// Enhanced Microsoft connection status check
	// useEffect(() => {
	//   const checkMicrosoftConnection = async () => {
	//     try {
	//       const response = await fetch(
	//         `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/status`,
	//         {
	//           credentials: "include",
	//         }
	//       );
	//       const data = await response.json();
	//       setMicrosoftConnected(data.connected);

	//       // If we have a success or error message in the URL (after redirect)
	//       const urlParams = new URLSearchParams(window.location.search);
	//       const status = urlParams.get("auth_status");
	//       if (status === "success") {
	//         // You might want to show a success toast/message here
	//         // Remove the query params
	//         window.history.replaceState({}, "", window.location.pathname);
	//       }
	//     } catch (error) {
	//       console.error("Failed to check Microsoft connection:", error);
	//     }
	//   };

	//   checkMicrosoftConnection();
	// }, []);

	const handleGoogleConnect = () => {
		setGoogleConnected(!googleConnected);
	};

	const handleSave = () => {
		// In a real implementation, this would save the settings to your backend
		//console.log("Settings saved:", { syncProjects, syncInterval });
	};

	return (
		<div className="p-4 space-y-4">
			<Toaster />
			{/* Procore Integration Card */}
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle>Procore Integration</CardTitle>
					<CardDescription>
            Connect and manage your Procore account integration
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center space-x-2">
						{procoreConnected ? (
							<CheckCircle2 className="h-5 w-5 text-green-500" />
						) : (
							<AlertCircle className="h-5 w-5 text-yellow-500" />
						)}
						<span className="text-sm font-medium">
							{procoreConnected
								? "Connected to Procore"
								: "Not connected to Procore"}
						</span>
					</div>
					<Button
						onClick={handleProcoreConnect}
						variant={procoreConnected ? "destructive" : "default"}
					>
						{procoreConnected
							? "Disconnect from Procore"
							: "Connect to Procore"}
					</Button>
					{procoreConnected && (
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<Switch
									checked={syncProjects}
									id="sync-projects"
									onCheckedChange={setSyncProjects}
								/>
								<Label htmlFor="sync-projects">Sync Procore projects</Label>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sync-interval">Sync interval (minutes)</Label>
								<Input
									id="sync-interval"
									max="1440"
									min="1"
									onChange={(e) => setSyncInterval(e.target.value)}
									type="number"
									value={syncInterval}
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			{/* Microsoft Integration Card */}
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle>Microsoft Integration</CardTitle>
					<CardDescription>
            Connect and manage your Microsoft account integration
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6  ">
					<div className="flex items-center space-x-2">
						{microsoftConnected ? (
							<CheckCircle2 className="h-5 w-5 text-green-500" />
						) : (
							<AlertCircle className="h-5 w-5 text-yellow-500" />
						)}
						<span className="text-sm font-medium">
							{microsoftConnected
								? "Connected to Microsoft"
								: "Not connected to Microsoft"}
						</span>
					</div>
					{!microsoftConnected && (
						<Button
							onClick={handleMicrosoftConnect}
							variant={microsoftConnected ? "destructive" : "default"}
						>
              Connect to Microsoft
						</Button>
					)}
					{microsoftConnected && !microsoftWebhook && (
						<Button
							className="mr-4"
							disabled={isPending}
							onClick={() => registerOutlookCalendarWebhookMutation()}
						>
							{isPending ? (
								<div className="flex items-center space-x-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span>Connecting...</span>
								</div>
							) : (
								"Connect your outlook calendar"
							)}
						</Button>
					)}
					{microsoftConnected && !microsoftMailWebhook && (
						<Button
							className="mr-4"
							disabled={isPendingMail}
							onClick={() => registerOutlookMailWebhookMutation()}
						>
							{isPendingMail ? "Connecting..." : "Connect your outlook mail"}
						</Button>
					)}
					{(microsoftWebhook || isSuccess) && (
						<Button
							className="mr-4"
							variant={microsoftConnected ? "destructive" : "default"}
						>
              Disconnect Calendar
						</Button>
					)}
					{(microsoftMailWebhook || isSuccessMail) && (
						<Button
							className="mr-4"
							variant={microsoftConnected ? "destructive" : "default"}
						>
              Disconnect Mail
						</Button>
					)}
					{microsoftConnected && (
						<div className="space-y-4">
							{/* Add Microsoft-specific settings here */}
						</div>
					)}
				</CardContent>
			</Card>
			{/* Google Integration Card */}
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle>Google Integration</CardTitle>
					<CardDescription>
            Connect and manage your Google account integration
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center space-x-2">
						{googleConnected ? (
							<CheckCircle2 className="h-5 w-5 text-green-500" />
						) : (
							<AlertCircle className="h-5 w-5 text-yellow-500" />
						)}
						<span className="text-sm font-medium">
							{googleConnected
								? "Connected to Google"
								: "Not connected to Google"}
						</span>
					</div>
					<Button
						onClick={handleGoogleConnect}
						variant={googleConnected ? "destructive" : "default"}
					>
						{googleConnected ? "Disconnect from Google" : "Connect to Google"}
					</Button>
					{googleConnected && (
						<div className="space-y-4">
							{/* Add Google-specific settings here */}
						</div>
					)}
				</CardContent>
			</Card>
			{/* Save Settings Button */}
			<Button
				className="mt-4"
				disabled={!procoreConnected && !microsoftConnected && !googleConnected}
				onClick={handleSave}
			>
        Save Settings
			</Button>
		</div>
	);
}
