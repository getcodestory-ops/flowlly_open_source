import React, { useState, useEffect, use } from "react";
// import { Task, ViewMode } from "gantt-task-react";
import { Gantt } from "@/components/Schedule/gantt-task-react-main/src/components/gantt/gantt";
import {
  Task,
  ViewMode,
} from "@/components/Schedule/gantt-task-react-main/src/types/public-types";
import { ViewSwitcher } from "./view-switcher";
import {
  Icon,
  useToast,
  Box,
  Text,
  Spinner,
  Modal,
  useDisclosure,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import "react-date-picker/dist/DatePicker.css";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react/dist/index.css";
import { Flex } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { getActivities, deleteActivity } from "@/api/activity_routes";
import { getCriticalPath } from "@/api/schedule_routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityEntityToTask } from "@/utils/activityEntityToTask";
import {
  PiMagnifyingGlassPlus,
  PiMagnifyingGlassMinus,
  PiPathDuotone,
} from "react-icons/pi";

import { MdFormatListBulletedAdd } from "react-icons/md";
import { from } from "form-data";
import { ActivityEntity, UpdateActivityTypes } from "@/types/activities";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { updateActivity } from "@/api/activity_routes";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";
import AddNewActivityModal from "./AddNewActivityModal";
import UpdateActivityModal from "./UpdateActivityModal";
import { get } from "http";
import CustomDatePicker from "../DatePicker/DatePicker";

const ScheduleGanttInterface = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [fontSize, setFontSize] = useState(12);
  const {
    session,
    activeProject,
    activities,
    setTaskToView,
    setRightPanelView,
    scheduleProbability,
    setScheduleProbability,
    scheduleDate,
    userActivities,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    activities: state.userActivities,
    setTaskToView: state.setTaskToView,
    setRightPanelView: state.setRightPanelView,
    scheduleProbability: state.scheduleProbability,
    setScheduleProbability: state.setScheduleProbability,
    scheduleDate: state.scheduleDate,
    userActivities: state.userActivities,
  }));
  const { isOpen, onClose, onOpen } = useScheduleUpdate();

  const [tasks, setTasks] = React.useState<Task[]>(initTasks());
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [modifyTask, setModifyTask] = useState<ActivityEntity>();
  const dateToday = getCurrentDateFormatted();
  const [modalType, setModalType] = useState<string>("");
  const [probability, setProbability] = useState<number>(0.5);

  const dateAdjustment = () => {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate;
  };
  const [startDate, onStartChange] = useState<any>(dateAdjustment());

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

  const { mutate: mutateDeleteActivity, isPending: deletePending } =
    useMutation({
      mutationFn: deleteActivity,
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: data.message,
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

  // useEffect(() => {
  //   console.log("activities", activities);
  //   console.log("userActivities", userActivities);
  // }, [activities, userActivities]);

  useEffect(() => {
    if (activities) {
      if (activities.length > 0) {
        // console.log("activities", activities);
        const transformedTasks = activities
          .map(activityEntityToTask)
          .sort((a, b) => a.start.getTime() - b.start.getTime()); // Assuming the data you want is in activities.data
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
  }, [activities]);

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

  const handelTaskSelection = (task: Task) => {
    activities?.map((activity) => {
      if (activity.id === task.id) {
        setTaskToView(activity);
      }
    });
  };

  const handleTaskChange = (task: Task) => {
    // console.log("On date change Id:" + task.id);
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
    if (!activeProject || !session) return;

    const conf = window.confirm("Are you sure to delete " + task.name + " ?");
    if (conf) {
      mutateDeleteActivity({
        session,
        projectId: activeProject.project_id,
        activityId: task.id,
      });
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    // console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    setModifyTask(userActivities.find((t) => t.id === task.id));

    setEditOpen(true);
  };

  const handleClick = (task: Task) => {
    handelTaskSelection(task);
    // setRightPanelView("task");
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    // console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    // console.log("On expander click Id:" + task.id);
  };

  const handleAddActivity = () => {
    setModalType("Add");
    onOpen();
  };

  const tooltip = (task: Task) => {
    return (
      <Flex
        bg={"white"}
        width={"300px"}
        p={4}
        boxShadow={"md"}
        borderRadius={"12px"}
      >
        <Text as={"b"} fontSize={"sm"}>
          {task.name}
        </Text>
      </Flex>
    );
  };

  useEffect(() => {
    console.log("Gantt modifyTask", modifyTask);
  }, [modifyTask]);

  return (
    <Flex direction={"column"} w="full">
      <Flex direction={"column"}>
        <AddNewActivityModal isOpen={isOpen} onClose={onClose} />
        {modifyTask && (
          <UpdateActivityModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            tasks={activities}
            modifyTask={modifyTask}
          />
        )}

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

          {/* <Icon
            as={MdFormatListBulletedAdd}
            cursor={"pointer"}
            onClick={handleAddActivity}
          /> */}
        </Flex>
        <ViewSwitcher
          onViewModeChange={(viewMode) => setView(viewMode)}
          onViewListChange={setIsChecked}
          isChecked={isChecked}
          View={view}
        />
        <Text fontSize={"md"} fontWeight={"bold"} mt={"2"}>
          {view} View
        </Text>
      </Flex>
      <Flex
        className="Wrapper"
        flexDir={"column"}
        backgroundColor="white"
        overflow={"hidden"}
        overscrollBehaviorY={"contain"}
        w={"full"}
      >
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
          listCellWidth={isChecked ? "120px" : ""}
          rowHeight={fontSize * 3}
          columnWidth={columnWidth}
          fontSize={`${fontSize}px`}
          TooltipContent={({ task, fontSize, fontFamily }) => {
            // console.log("TooltipContent", { task, fontSize, fontFamily });
            return tooltip(task) as unknown as JSX.Element;
          }}
        />
      </Flex>
    </Flex>
  );
};

export default ScheduleGanttInterface;
