"use client";
import { useEffect, useState } from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProjectEntity } from "@/types/projects";

import { useStore } from "@/utils/store";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMembers } from "@/api/membersRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import { createClient } from "@/utils/supabase/client";
import { RiTeamLine } from "react-icons/ri";
import { MembersModal } from "@/components/MembersModal/MembersModal";

const queryClient = new QueryClient();
type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export function ProjectSwitcher({ className }: TeamSwitcherProps) {
  const {
    members,
    session,
    userProjects,
    activeProject,
    setActiveProject,
    setUserProjects,
    setMembers,
    setSession,
  } = useStore((state) => ({
    members: state.members,
    session: state.session,
    userProjects: state.userProjects,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    setUserProjects: state.setUserProjects,
    setMembers: state.setMembers,
    setSession: state.setSession,
  }));

  // useEffect(() => {
  //   if (projects && projects.length > 0) {
  //     setUserProjects(projects);
  //     setActiveProject(projects[0]);
  //   }
  // }, [projects?.length, setUserProjects, projects, setActiveProject]);

  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getMembers(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (membersData && membersData.data.length > 0) {
      setMembers(membersData.data);
    }
  }, [membersData, setMembers]);

  const supabase = createClient();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["initialProjectList", session],
    queryFn: () => {
      if (session && session.access_token) {
        return getProjects(session!, "SCHEDULE");
      }
      return Promise.reject("No session or access token");
    },
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (userProjects.length === 0) return;

    setActiveProject(userProjects[0]);
  }, [userProjects.length, userProjects, setActiveProject]);

  useEffect(() => {
    if (data && data.length > 0 && isSuccess) {
      setUserProjects(data);
    }
  }, [data?.length, isSuccess, setUserProjects, data]);

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setSession(data.session);
      }
    }
    loginCheck();
  }, [setSession]);

  const [open, setOpen] = useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);

  return (
    <>
      <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a team"
              className={cn("w-[200px] justify-between", className)}
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/personal.png`}
                  alt={activeProject?.name ? activeProject.name : "No Project"}
                  className="grayscale"
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              {activeProject?.name.length
                ? activeProject.name.slice(0, 15)
                : "No Project"}
              <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandList>
                <CommandInput placeholder="Search Project..." />
                <CommandEmpty>No Project found.</CommandEmpty>

                <CommandGroup>
                  {userProjects && userProjects.length > 0 ? (
                    userProjects.map((project) => (
                      <CommandItem
                        key={project.project_id}
                        onSelect={() => {
                          setActiveProject(project);
                          // router.push(
                          //   `/documents?projectId=${project.project_id}`
                          // );
                          setOpen(false);
                        }}
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
                          onClick={() => setIsMembersOpen(true)}
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
              </CommandList>

              <CommandSeparator />

              <CommandList>
                <CommandGroup>
                  <DialogTrigger asChild>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setShowNewTeamDialog(true);
                      }}
                    >
                      <PlusCircledIcon className="mr-2 h-5 w-5" />
                      Create Project
                    </CommandItem>
                  </DialogTrigger>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Add a new project to manage your data.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" placeholder="Acme Inc." />
              </div>
              {/* <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{" "}
                    <span className="text-muted-foreground">
                      Trial for two weeks
                    </span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{" "}
                    <span className="text-muted-foreground">
                      $9/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTeamDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MembersModal
        onCancel={() => setIsMembersOpen(false)}
        isOpen={isMembersOpen}
        // members={members}
        projectAccessId={activeProject?.project_id}
      />
    </>
  );
}

export default function Switcher() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectSwitcher />
    </QueryClientProvider>
  );
}
