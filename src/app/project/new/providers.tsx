"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabaseClient";
import { Toaster } from "@/components/ui/toaster";
import { EnhancedSidePanel } from "@/components/TopBar/EnhancedSidePanel";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Prevent automatic refetch on window focus - reduces unnecessary reloads
			refetchOnWindowFocus: false,
			// Keep data fresh for 30 seconds before considering it stale
			staleTime: 30 * 1000,
			// Retry failed requests once
			retry: 1,
		},
	},
});

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const { setSessionToken } = useStore((state) => ({
		setSessionToken: state.setSession,
		userProjects: state.userProjects,
		setActiveProject: state.setActiveProject,
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
