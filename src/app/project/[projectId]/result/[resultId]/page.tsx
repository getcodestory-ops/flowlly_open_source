"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getEventResult } from "@/api/taskQueue";
import { ResultViewer } from "@/components/WorkflowComponents/ResultViewer";
import { Loader2 } from "lucide-react";
import supabase from "@/utils/supabaseClient";
import { getProjects } from "@/api/projectRoutes";
import type { EventResult } from "@/components/WorkflowComponents/types";

export default function EventResultPage() {
	const params = useParams();
	const router = useRouter();
	const projectId = params?.projectId as string;
	const resultId = params?.resultId as string;

	const { session, setSessionToken, setUserProjects, setActiveProject, activeProject } = useStore(
		(state) => ({
			session: state.session,
			setSessionToken: state.setSession,
			setUserProjects: state.setUserProjects,
			setActiveProject: state.setActiveProject,
			activeProject: state.activeProject,
		}),
	);

	// Check authentication and initialize session
	useEffect(() => {
		async function checkAuth() {
			const { data } = await supabase.auth.getSession();
			
			if (!data?.session?.user) {
				// Preserve the current URL so we can redirect back after login
				const currentUrl = window.location.pathname + window.location.search;
				router.replace(`/applogin?redirect=${encodeURIComponent(currentUrl)}`);
				return;
			}

			if (!session) {
				setSessionToken(data.session);
			}

			if (!activeProject) {
				const projects = await getProjects(data.session);
				setUserProjects(projects);
				
				const matchingProject = projects.find((p) => p.project_id === projectId) || projects[0];
				if (matchingProject) {
					setActiveProject(matchingProject);
				} else if (projects.length > 0) {
					router.replace(`/project/${projects[0].project_id}/meetings`);
				} else {
					router.replace("/project/new");
				}
			} else if (activeProject.project_id !== projectId) {
				const projects = await getProjects(data.session);
				const matchingProject = projects.find((p) => p.project_id === projectId);
				if (matchingProject) {
					setActiveProject(matchingProject);
				}
			}
		}
		
		void checkAuth();
	}, [router, session, setSessionToken, setUserProjects, setActiveProject, activeProject, projectId]);

	// Fetch event result
	const {
		data: eventResultData,
		isLoading: isLoadingResult,
		isError: isErrorResult,
		error: resultError,
	} = useQuery({
		queryKey: ["eventResult", resultId, projectId],
		queryFn: async () => {
			if (!session || !projectId || !resultId) {
				return null;
			}

			const result = await getEventResult({
				session,
				projectId,
				resultId,
			});

			return result;
		},
		enabled: !!session && !!projectId && !!resultId,
		staleTime: 0,
		refetchOnWindowFocus: true,
	});

	// Extract the actual result from the response
	const currentResult: EventResult | null = eventResultData?.result || null;

	// Loading state
	if (!session || isLoadingResult) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<Loader2 className="animate-spin mx-auto mb-4" size="48" />
					<p className="text-gray-600">Loading event result...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (isErrorResult || !currentResult) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<p className="text-red-600 mb-4">
						{isErrorResult
							? `Error loading result: ${resultError instanceof Error ? resultError.message : "Unknown error"}`
							: "Event result not found"}
					</p>
					<button
						onClick={() => router.push(`/project/${projectId}/meetings`)}
						className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
					>
						Back to Meetings
					</button>
				</div>
			</div>
		);
	}

	// Success state - render ResultViewer
	return (
		<div className="h-screen w-full overflow-hidden">
			<ResultViewer
				currentResult={currentResult}
				backToMeetings={true}
				onClose={() => {
					router.push(`/project/${projectId}/meetings`);
				}}
			/>
		</div>
	);
}

