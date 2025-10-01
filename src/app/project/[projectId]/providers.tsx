"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { useIntegrationStore } from "@/hooks/useIntegrationStore";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabaseClient";
import { Toaster } from "@/components/ui/toaster";
import { EnhancedSidePanel } from "@/components/TopBar/EnhancedSidePanel";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const { setSessionToken, session, activeProject } = useStore((state) => ({
		setSessionToken: state.setSession,
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { fetchAllIntegrations, clearIntegrations } = useIntegrationStore((state) => ({
		fetchAllIntegrations: state.fetchAllIntegrations,
		clearIntegrations: state.clearIntegrations,
	}));

	useEffect(() => {
		async function loginCheck() {
			const { data } = await supabase.auth.getSession();

			if (!data?.session?.user) {
				router.replace("/applogin");
			} else {
				setSessionToken(data?.session);
			}
		}
		loginCheck();
	}, [router, setSessionToken]);

	// Automatically fetch integrations when active project changes
	useEffect(() => {
		if (session && activeProject?.project_id) {
			fetchAllIntegrations(session, activeProject.project_id);
		} else {
			// Clear integrations when no active project
			clearIntegrations();
		}
	}, [session, activeProject?.project_id, fetchAllIntegrations, clearIntegrations]);

	return (
		<QueryClientProvider client={queryClient}>
			<Toaster />
			<TooltipProvider>
				<div className="flex w-[100vw] h-[100vh]">
					<EnhancedSidePanel />
					<ScrollArea className="flex-1 h-full overflow-hidden">
						{children}
					</ScrollArea>
				</div>
			</TooltipProvider>
		</QueryClientProvider>
	);
}
