import React, { useEffect } from "react";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SideMenuPanel } from "@/components/TopBar/SideMenuPanel";
import ScheduleInterface from "./ScheduleInterface";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import ProjectSetup from "./ProjectSetup";
import checkProjectStatus from "@/utils/checkProjectStatus";
import Integration from "./Integration";
import { DocumentFolderModule } from "@/components/Dailies/DocumentModule";
import ProjectBoard from "@/components/ProjectDashboard/ProjectDashboard";
import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatComponent from "@/components/ChatInput/ChatComponet";
import ConstructionDashboard from "@/components/ProjectDashboard/ConstructionDashboard";
const queryClient = new QueryClient();

export default function MainLayout({
	children,
}: {
  children?: React.ReactNode;
}): React.ReactNode {
	const router = useRouter();
	const path = router.pathname;

	const {
		setSessionToken,
		appView,
		setAppView,
		userActivities,

		setProjectStatus,
	} = useStore((state) => ({
		setSessionToken: state.setSession,
		appView: state.appView,
		setAppView: state.setAppView,
		userActivities: state.userActivities,

		setProjectStatus: state.setProjectStatus,
	}));

	useEffect(() => {
		setProjectStatus(checkProjectStatus(userActivities));
	}, [userActivities]);

	useEffect(() => {
		async function loginCheck(): Promise<void> {
			const { accessToken, refreshToken } = router.query;

			if (accessToken && refreshToken) {
				if (
					typeof accessToken === "string" &&
          			typeof refreshToken === "string"
				) {
					await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});
				}
			}

			const { data } = await supabase.auth.getSession();

			if (!data?.session?.user) {
				setAppView("login");
				router.replace("/");
			} else {
				setSessionToken(data?.session);
				if (path === "/auth/passwordChange") {
					setAppView("changePassword");
				} else {
					setAppView("dashboard");
				}
			}
		}
		loginCheck();
	}, []);

	useEffect(() => {
		if (path === "/auth/passwordChange") {
			setAppView("changePassword");
		} else {
			setAppView("dashboard");
		}
	}, [router.pathname]);

	return (
		<>
			<main>
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>
						<div className="w-full h-full overflow-auto">
							{(appView === "login" || appView === "changePassword") && (
								<div className=" flex flex-col w-[100vw] h-[100vh] ">
									{children}
								</div>
							)}
							{appView !== "login" && appView !== "changePassword" && (
								<div className=" flex flex-col w-[100vw] h-[100vh] ">
									<ProjectInfoDisplay />
									<MainDisplayInLayout appView={appView} />
								</div>
							)}
						</div>
					</TooltipProvider>
				</QueryClientProvider>
			</main>
		</>
	);
}

const MainDisplayInLayout = ({ appView }: { appView: string }): React.ReactNode => {
	return (
		<div className="flex gap-2 p-1 w-full h-full overflow-hidden">
			<div className="w-12 border-r">
				<SideMenuPanel />
			</div>
			<ScrollArea className="flex-grow ">
				{appView === "dashboard" && <ConstructionDashboard />}
				{appView === "schedule" && <ScheduleInterface />}
				{appView === "agent" && <ChatComponent />}
				{appView === "updates" && <DocumentFolderModule />}
				{appView === "project" && <ProjectBoard />}
				{appView === "members" && <ProjectSetup />}
				{appView === "integrations" && <Integration />}
			</ScrollArea>
		</div>
	);
};
