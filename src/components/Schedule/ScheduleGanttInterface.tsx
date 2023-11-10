import React, { useState, useEffect } from "react";
import { Task, ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "./view-switcher";
import { Icon, useToast } from "@chakra-ui/react";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react/dist/index.css";
import { Flex } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { getCriticalPath } from "@/api/schedule_routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityEntityToTask } from "@/utils/activityEntityToTask";
import {
  PiMagnifyingGlassPlus,
  PiMagnifyingGlassMinus,
  PiPathDuotone,
} from "react-icons/pi";
import { from } from "form-data";

const ScheduleGanttInterface = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [fontSize, setFontSize] = useState(12);
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const [tasks, setTasks] = React.useState<Task[]>(initTasks());

  const {
    data: activities,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["activityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }

      return getActivities(session, activeProject.project_id);
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: getCriticalPath,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Critical path calculated !",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    },
  });

  const handleCriticalPath = () => {
    if (!session || !activeProject) {
      toast({
        title: "Error",
        description: "Set session first !",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      return Promise.reject("Set session first !");
    }
    mutate({ session, projectId: activeProject.project_id });
  };

  useEffect(() => {
    if (isSuccess && activities) {
      if (activities.length > 0) {
        const transformedTasks = activities.map(activityEntityToTask); // Assuming the data you want is in activities.data
        setTasks(transformedTasks);
      } else {
        const currentDate = new Date();
        setTasks([
          {
            start: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            ),
            end: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            ),
            name: "No data available",
            id: "ProjectSample",
            progress: 0,
            type: "project",
            hideChildren: false,
            displayOrder: 1,
          },
        ]);
      }
    }
  }, [isSuccess, activities]);

  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);

  const [isChecked, setIsChecked] = React.useState(true);
  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = fontSize * 30;
  } else if (view === ViewMode.Month) {
    columnWidth = fontSize * 20;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project =
        newTasks[newTasks.findIndex((t) => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map((t) =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  return (
    <Flex
      className="Wrapper"
      flexDir={"column"}
      backgroundColor="white"
      p={2}
      width="full"
      overflow={"auto"}
      height="100vh"
    >
      <Flex>
        <Icon
          as={PiMagnifyingGlassPlus}
          cursor={"pointer"}
          onClick={() => setFontSize((state) => state + 1)}
        />
        <Icon
          as={PiMagnifyingGlassMinus}
          cursor={"pointer"}
          onClick={() => setFontSize((state) => state - 1)}
        />
        <Icon
          as={PiPathDuotone}
          cursor={"pointer"}
          onClick={handleCriticalPath}
        />
      </Flex>
      <ViewSwitcher
        onViewModeChange={(viewMode) => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "150px" : ""}
        rowHeight={fontSize * 3}
        columnWidth={columnWidth}
        fontSize={`${fontSize}px`}
      />
    </Flex>
  );
};

export default ScheduleGanttInterface;
