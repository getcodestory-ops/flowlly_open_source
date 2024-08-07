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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/utils/store";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import supabase from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import { ProjectEntity } from "@/types/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export function ProjectSwitcher({ className }: TeamSwitcherProps) {
  // const router = useRouter();
  // const { query } = router;
  // const projectId = query.projectId as string;

  const {
    session,
    userProjects,
    activeProject,
    setActiveProject,
    setUserProjects,
    setSession,
  } = useStore((state) => ({
    session: state.session,
    userProjects: state.userProjects,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    setUserProjects: state.setUserProjects,
    setSession: state.setSession,
  }));

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["initialProjectList", session],
    queryFn: () => getProjects(session!, "SCHEDULE"),
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (userProjects.length === 0) return;

    // if (projectId) {
    //   const project = userProjects.find(
    //     (p: ProjectEntity) => p.project_id === projectId
    //   );

    //   if (project) {
    //     setActiveProject(project);
    //     return;
    //   }
    // }

    setActiveProject(userProjects[0]);
  }, [userProjects.length, setUserProjects, setActiveProject]);

  useEffect(() => {
    if (data && data.length > 0 && isSuccess) {
      setUserProjects(data);
    }
  }, [data?.length, isSuccess, setUserProjects]);

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
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            {activeProject?.name.length
              ? activeProject.name.slice(0, 15)
              : "No Project"}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search Project..." />
              <CommandEmpty>No Project found.</CommandEmpty>

              {isLoading ? (
                <CommandItem>Loading projects...</CommandItem>
              ) : (
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
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/personal.png`}
                            alt={project.name}
                            className="grayscale"
                          />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {project.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            activeProject?.project_id === project.project_id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem>No projects available</CommandItem>
                  )}
                </CommandGroup>
              )}
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
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Add a new team to manage products and customers.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
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
          <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Switcher() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectSwitcher />
    </QueryClientProvider>
  );
}
