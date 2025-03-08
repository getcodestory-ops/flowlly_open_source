"use client";

import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import ShareProjectModal from "../Schedule/ShareProjectModal";
import { deleteProject } from "@/api/projectRoutes";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AddNewProjectButton } from "../Schedule/AddNewProjectModal";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Button } from "../ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectEntity } from "@/types/projects";

function ProjectBoard() {
	const [isShareOpen, setShareModal] = useState<boolean>(false);
	const pathname = usePathname();
	const params = useParams();
	const router = useRouter();
	const toast = useToast();
	const queryClient = useQueryClient();
	const { userProjects, activeProject, setActiveProject, session } = useStore(
		(state) => ({
			userProjects: state.userProjects,
			activeProject: state.activeProject,
			setActiveProject: state.setActiveProject,
			session: state.session,
		}),
	);

	const mutation = useMutation({
		mutationFn: ({ selectedProjectId }: { selectedProjectId: string }) =>
			deleteProject(session!, selectedProjectId),
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["initialProjectList"],
			});
			toast({
				title: "Success",
				description: "Project Unassigned successfully",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
		},
	});

	const switchProject = (project: ProjectEntity) => {
		const projectId = params ? params?.projectId : null;

		if (projectId && pathname && pathname.includes(`/${projectId}/`)) {
			const newPath = pathname.replace(
				`/${projectId}/`,
				`/${project.project_id}/`,
			);
			router.push(newPath);
		}

		setActiveProject(project);
	};

	return (
		<ScrollArea className="h-full bg-brand-light p-4 rounded-lg flex items-start ">
			<ShareProjectModal
				isShareOpen={isShareOpen}
				shareModalClose={() => {
					setShareModal(false);
				}}
			/>
			<div>
				{userProjects && (
					<>
						<div className="text-sm font-medium pl-4">Projects</div>
						<div className="w-full p-4 grid gap-[20px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							<AddNewProjectButton>
								<Button
									className="h-full text-[70px] flex items-center justify-center"
									variant="outline"
								>
                  +
								</Button>
							</AddNewProjectButton>
							{userProjects.map((project) => (
								<ProjectFolder
									date={project.last_update}
									isSelected={activeProject?.project_id === project.project_id}
									key={`project-menu-${project.project_id}`}
									onClick={() => {
										switchProject(project);
									}}
									onExitProject={() =>
										mutation.mutate({
											selectedProjectId: project.project_id,
										})
									}
									onShare={() => setShareModal(true)}
									projectName={project.name}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</ScrollArea>
	);
}

const ProjectFolder = ({
	projectName,
	onClick,
	date,
	onShare,
	onExitProject,
	isSelected,
}: {
  projectName: string;
  onClick: () => void;
  date: string;
  onShare: () => void;
  onExitProject: () => void;
  isSelected: boolean;
}) => {
	return (
		<div className="rounded-lg shadow-md hover:shadow-lg transition-shadow w-full hover:cursor-pointer h-full">
			<Card
				className={`${
					isSelected
						? "bg-gradient-to-b from-indigo-500 to-purple-500 text-white"
						: "hover:bg-blue-50  hover:border-blue-300"
				} `}
			>
				<div onClick={onClick}>
					<CardHeader className="pb-2">
						<CardDescription className={`${isSelected ? "text-white" : ""} `}>
							{timeAgo(date)}
						</CardDescription>
						<CardTitle className="max-h-full flex flex-row items-center gap-3 min-h-7">
							<div className="text-xl h-full overflow-hidden text-ellipsis whitespace-nowrap flex-1 ">
								{projectName}
							</div>
						</CardTitle>
					</CardHeader>
				</div>
				<CardFooter className="flex flex-row justify-end">
					<AlertDialog>
						<Tooltip>
							<TooltipTrigger asChild>
								<AlertDialogTrigger asChild>
									<Button className="text-xl" variant="ghost">
										<LogOut size="sm" />
									</Button>
								</AlertDialogTrigger>
							</TooltipTrigger>
							<TooltipContent>
								<p>Exit from Project</p>
							</TooltipContent>
						</Tooltip>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
                  Leaving {projectName}! Are you sure?
								</AlertDialogTitle>
								<AlertDialogDescription>
                  This action cannot be undone. This will permanently remove you
                  from this project.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={onExitProject}>
                  Yes, I am sure.
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardFooter>
			</Card>
		</div>
	);
};

function timeAgo(dateString: string): string {
	const now = new Date();
	const date = new Date(dateString);

	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals = [
		{ label: "y", seconds: 31536000 }, // 1 year = 365 * 24 * 60 * 60
		{ label: "m", seconds: 2592000 }, // 1 month = 30 * 24 * 60 * 60
		{ label: "wk", seconds: 604800 }, // 1 week = 7 * 24 * 60 * 60
		{ label: "d", seconds: 86400 }, // 1 day = 24 * 60 * 60
		{ label: "h", seconds: 3600 }, // 1 hour = 60 * 60
		{ label: "m", seconds: 60 }, // 1 minute = 60
		{ label: "s", seconds: 1 }, // 1 second
	];

	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return `Updated ${count}${interval.label} ago`;
		}
	}

	return "Created just now";
}

export default ProjectBoard;
