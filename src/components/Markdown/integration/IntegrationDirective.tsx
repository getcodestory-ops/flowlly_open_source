import React from "react";
import { Link, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/utils/store";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getApiIntegration } from "@/api/integration_routes";

interface IntegrationDirectiveProps {
	data: string;
}

const IntegrationDirective: React.FC<IntegrationDirectiveProps> = ({ data }) => {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	// Parse the integration data to get the service type
	let service = "";
	try {
		const integrationData = JSON.parse(data);
		service = integrationData.service;
	} catch (error) {
		console.error("Error parsing integration data:", error);
	}

	// Query to check if the integration is connected
	const { data: integrationState } = useQuery({
		queryKey: ["integration", activeProject?.project_id, service],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, service),
		enabled: !!session && !!activeProject?.project_id && !!service,
	});

	const isConnected = !!integrationState;

	const handleIntegration = (service: string) => {
		if (service === "procore") {
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
		} else if (service === "microsoft") {
			if (!session || !activeProject) {
				toast({
					title: "Error",
					description: "Either session or project is not valid!",
					duration: 4000,
				});
				return;
			}

			const sessionToken = session.access_token;
			const userId = session.user?.id;
			const projectId = activeProject.project_id;

			if (!sessionToken || !userId || !projectId) {
				toast({
					title: "Error",
					description: "Missing required authentication data!",
					duration: 4000,
				});
				return;
			}

			// Redirect to Microsoft OAuth login with specific scopes
			const params = new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_GRAPH_CLIENT_ID ?? "",
				response_type: "code",
				redirect_uri: process.env.NEXT_PUBLIC_GRAPH_REDIRECT_URI ?? "",
				response_mode: "query",
				scope: "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite Mail.Read Mail.ReadWrite Mail.Send email User.Read",
				state: sessionToken + "___" + userId + "___" + projectId,
			});

			const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
			window.location.href = authUrl;
		}
	};

	try {
		const integrationData = JSON.parse(data);
		const service = integrationData.service;

		if (service === "procore") {
			if (isConnected) {
				return (
					<div className="flex w-full transition-all my-2">
						<div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
							<CheckCircle2 className="w-5 h-5 text-green-600" />
							<div className="flex-1">
								<div className="font-medium text-green-800 text-sm">
									Procore Connected
								</div>
								<div className="text-xs text-green-600 mt-1">
									Your Procore account is successfully connected
								</div>
							</div>
							<Button
								className="bg-green-600 hover:bg-green-700"
								onClick={() => handleIntegration("procore")}
								size="sm"
							>
								Reauthenticate
							</Button>
						</div>
					</div>
				);
			}

			return (
				<div className="flex w-full transition-all my-2">
					<div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
						<Link className="w-5 h-5 text-blue-600" />
						<div className="flex-1">
							<div className="font-medium text-blue-800 text-sm">
								Procore Integration Available
							</div>
							<div className="text-xs text-blue-600 mt-1">
								Connect your Procore account to sync project data
							</div>
						</div>
						<Button
							className="bg-blue-600 hover:bg-blue-700"
							onClick={() => handleIntegration("procore")}
							size="sm"
						>
							Connect Procore
						</Button>
					</div>
				</div>
			);
		}

		if (service === "microsoft") {
			if (isConnected) {
				return (
					<div className="flex w-full transition-all my-2">
						<div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
							<CheckCircle2 className="w-5 h-5 text-green-600" />
							<div className="flex-1">
								<div className="font-medium text-green-800 text-sm">
									Microsoft Connected
								</div>
								<div className="text-xs text-green-600 mt-1">
									Your Microsoft account is successfully connected
								</div>
							</div>
							<Button
								className="bg-green-600 hover:bg-green-700"
								onClick={() => handleIntegration("microsoft")}
								size="sm"
							>
								Reauthenticate
							</Button>
						</div>
					</div>
				);
			}

			return (
				<div className="flex w-full transition-all my-2">
					<div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
						<Link className="w-5 h-5 text-blue-600" />
						<div className="flex-1">
							<div className="font-medium text-blue-800 text-sm">
								Microsoft Integration Available
							</div>
							<div className="text-xs text-blue-600 mt-1">
								Connect your Microsoft account to access Office 365, SharePoint, and more
							</div>
						</div>
						<Button
							className="bg-blue-600 hover:bg-blue-700"
							onClick={() => handleIntegration("microsoft")}
							size="sm"
						>
							Connect Microsoft
						</Button>
					</div>
				</div>
			);
		}

		// Default case for other services
		if (isConnected) {
			return (
				<div className="flex w-full transition-all my-2">
					<div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
						<CheckCircle2 className="w-5 h-5 text-green-600" />
						<div className="flex-1">
							<div className="font-medium text-green-800 text-sm">
								{service} Connected
							</div>
							<div className="text-xs text-green-600 mt-1">
								Your {service} account is successfully connected
							</div>
						</div>
						<Button
							className="bg-green-600 hover:bg-green-700"
							onClick={() => handleIntegration(service)}
							size="sm"
						>
							Reauthenticate
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="flex w-full transition-all my-2">
				<div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
					<Link className="w-5 h-5 text-gray-600" />
					<div className="flex-1">
						<div className="font-medium text-gray-800 text-sm">
							{service} Integration Available
						</div>
						<div className="text-xs text-gray-600 mt-1">
							Connect your {service} account
						</div>
					</div>
					<Button
						onClick={() => handleIntegration(service)}
						size="sm"
						variant="outline"
					>
						Connect {service}
					</Button>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error parsing integration data:", error);
		return (
			<div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
				<div className="text-red-700 font-medium">Error parsing integration data</div>
				<div className="text-red-600 text-xs mt-1">Raw data: {data}</div>
			</div>
		);
	}
};

export default IntegrationDirective; 