"use client";

import React from "react";
import { useStore } from "@/utils/store";
import { ProjectEntity } from "@/types/projects";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Building } from "lucide-react";


export function CustomProjectSwitcher({
	onProjectSwitch,
	className,
}: {
  onProjectSwitch: () => void;
  className?: string;
}): React.ReactNode {
	const { userProjects, activeProject } = useStore(
		(state) => ({
			userProjects: state.userProjects,
			activeProject: state.activeProject,
		}),
	);
	//if there is only one project, don't show the switcher
	if (userProjects && userProjects.length === 1) {
		return null;
	}

	return (
		<div className={className}>
			<Command>
				<CommandInput placeholder="Switch Project..." />
				<CommandList>
					<CommandEmpty>No Project found.</CommandEmpty>
					<CommandGroup>
						{userProjects && userProjects.length > 0 ? (
							userProjects.filter((project) => project.project_id !== activeProject?.project_id).map((project) => (
								<CommandItem key={project.project_id}>
									<ProjectLineItem
										onProjectSwitch={onProjectSwitch}
										project={project}
									/>
								</CommandItem>
							))
						) : (
							<CommandItem>No projects available</CommandItem>
						)}
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	);
}

const ProjectLineItem = ({
	project,
	onProjectSwitch,
}: {
  project: ProjectEntity;
  onProjectSwitch: () => void;
}): React.ReactNode => {
	const router = useRouter();
	const params = useParams();
	const pathname = usePathname();

	const {  setActiveProject, setActiveChatEntity } = useStore(
		(state) => ({
			setActiveProject: state.setActiveProject,
			setActiveChatEntity: state.setActiveChatEntity,
		}),
	);

	const switchProject = (project: ProjectEntity): void => {
		// Update URL if needed
		const projectId = params ? params?.projectId : null;
		setActiveChatEntity(null);


		if (projectId && pathname && pathname.includes(`/${projectId}/`)) {
			const newPath = pathname.replace(
				`/${projectId}/`,
				`/${project.project_id}/`,
			);
			router.push(newPath);
		}

		// Set the active project
		setActiveProject(project);

		// Call the callback to close the switcher
		onProjectSwitch();
	};
	return (
		<>
			<div 
				className="text-sm px-2 w-full flex flex-row gap-2 items-center"
				onClick={() => switchProject(project)}
			>
				<Building className="h-4 w-4 text-gray-500" />
				{project.name}
			</div>
		</>
	);
};
