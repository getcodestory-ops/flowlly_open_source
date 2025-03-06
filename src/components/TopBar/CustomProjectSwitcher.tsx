"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { ProjectEntity } from "@/types/projects";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useRouter, useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RiTeamLine } from "react-icons/ri";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddNewProjectModalContent } from "@/components/Schedule/AddNewProjectModal";
import { MembersModal } from "@/components/MembersModal/MembersModal";

export function CustomProjectSwitcher({
  onProjectSwitch,
  className,
}: {
  onProjectSwitch: () => void;
  className?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const { userProjects, activeProject, setActiveProject } = useStore(
    (state) => ({
      session: state.session,
      userProjects: state.userProjects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
      setUserProjects: state.setUserProjects,
      setMembers: state.setMembers,
      setActiveChatEntity: state.setActiveChatEntity,
      setChatEntities: state.setChatEntities,
    })
  );

  const switchProject = (project: ProjectEntity) => {
    // Update URL if needed
    const projectId = params ? params?.projectId : null;

    if (projectId && pathname && pathname.includes(`/${projectId}/`)) {
      const newPath = pathname.replace(
        `/${projectId}/`,
        `/${project.project_id}/`
      );
      router.push(newPath);
    }

    // Set the active project
    setActiveProject(project);

    // Call the callback to close the switcher
    onProjectSwitch();
  };

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);

  return (
    <div className={className}>
      <AlertDialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
        <Command>
          <CommandInput placeholder="Search Project..." />
          <CommandList>
            <CommandEmpty>No Project found.</CommandEmpty>
            <CommandGroup>
              {userProjects && userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <CommandItem
                    key={project.project_id}
                    onSelect={() => switchProject(project)}
                    className="text-sm"
                  >
                    <div className="flex flex-row gap-2">
                      <CheckIcon
                        className={cn(
                          "mr-auto h-4 w-4",
                          activeProject?.project_id === project.project_id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="mr-2">{project.name}</span>
                    </div>
                    <div
                      className="ml-auto h-5 w-5 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMembersOpen(true);
                      }}
                    >
                      <RiTeamLine
                        className={
                          activeProject?.project_id === project.project_id
                            ? "opacity-100"
                            : "opacity-0"
                        }
                      />
                    </div>
                  </CommandItem>
                ))
              ) : (
                <CommandItem>No projects available</CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              <AlertDialogTrigger asChild>
                <CommandItem
                  onSelect={() => {
                    setShowNewTeamDialog(true);
                  }}
                >
                  <PlusCircledIcon className="mr-2 h-5 w-5" />
                  Create Project
                </CommandItem>
              </AlertDialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>

        <AlertDialogContent>
          <AddNewProjectModalContent setIsOpen={setShowNewTeamDialog} />
        </AlertDialogContent>
      </AlertDialog>

      <MembersModal
        onCancel={() => setIsMembersOpen(false)}
        isOpen={isMembersOpen}
        projectAccessId={activeProject?.project_id}
      />
    </div>
  );
}
