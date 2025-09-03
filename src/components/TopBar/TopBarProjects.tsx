import React, { useState, useEffect } from "react";
import {
	Flex,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Heading,
	useToast,
	Icon,
	Text,
} from "@chakra-ui/react";
import { IoChevronDownOutline } from "react-icons/io5";
import { ProjectEntity } from "@/types/projects";
import TopActivitiesItems from "./TopActivitiesItem";
import { getProjects } from "@/api/projectRoutes";
import { useStore } from "@/utils/store";
import { ActivityEntity } from "@/types/activities";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useChatStore } from "@/hooks/useChatStore";

interface TopBarMenuItemsProps {
  taskToView: ActivityEntity;
  renderProjects: number;
}

const TopBarProjects = ({
	taskToView,
	renderProjects,
}: TopBarMenuItemsProps) => {
	const router = useRouter();
	const { projectId } = router.query;
	const [activeProjectMenu, setActiveProjectMenu] =
    useState<ProjectEntity | null>(null);

	const { session, setActiveProject, setActiveChatEntity, setChatEntities, setLocalChats } = useStore((state) => ({
		session: state.session,
		setActiveProject: state.setActiveProject,
		setActiveChatEntity: state.setActiveChatEntity,
		setChatEntities: state.setChatEntities,
		setLocalChats: state.setLocalChats,
	}));
	const { resetForNewChat } = useChatStore();

	const { data: projects, isLoading } = useQuery({
		queryKey: ["initialProjectList", session, taskToView],
		queryFn: () => getProjects(session!, taskToView.id ?? "SCHEDULE"),
		enabled: !!session?.access_token,
	});

	useEffect(() => {
		if (projects && projects.length > 0) {
			if (projectId) {
				const project = projects.filter(
					(project: ProjectEntity) => project.project_id === projectId,
				);
				if (project.length > 0) {
					setActiveProjectMenu(project[0]);
					setActiveProject(project[0]);
				} else {
					// Handle the case where the project with the given projectId is not found
					// For example, you might want to redirect to a default route or show an error
				}
			} else {
				// Use router.push with an object argument to navigate
				router.push({
					pathname: router.pathname,
					query: { projectId: projects[0].project_id },
				});
			}
		}
	}, [projects, projectId, router]);

	const changeProject = (project: ProjectEntity) => {
		if (renderProjects === 1) {
			router.push({
				query: { ...router.query, projectId: project.project_id },
			});
		} else {
			// Reset all chat state when switching projects
			setActiveChatEntity(null);
			setChatEntities([]);
			setLocalChats([]);
			resetForNewChat();
			
			setActiveProjectMenu(project);
			setActiveProject(project);
		}
	};

	return (
		<>
			{projects && projects.length > 0 && (
				<Flex alignItems="center">
					{renderProjects && (
						<>
							<Menu>
								<MenuButton fontSize="md" fontWeight="medium">
									<Flex alignItems="center" fontSize="xs">
										{activeProjectMenu?.name ? activeProjectMenu.name : ""}
										<Flex ml="2">
											<IoChevronDownOutline />
										</Flex>
									</Flex>
								</MenuButton>
								<MenuList>
									{renderProjects &&
                    projects.map((project: ProjectEntity) => (
                    	<Flex key={project.project_id}>
                    		<MenuItem
                    			onClick={() => {
                    				changeProject(project);
                    			}}
                    		>
                    			{project.name}
                    		</MenuItem>
                    	</Flex>
                    ))}
								</MenuList>
							</Menu>
							<Text m="2">/</Text>
						</>
					)}
					{activeProjectMenu && (
						<TopActivitiesItems
							activeProjectMenu={activeProjectMenu}
							renderProjects={renderProjects}
						/>
					)}
				</Flex>
			)}
		</>
	);
};
export default TopBarProjects;
