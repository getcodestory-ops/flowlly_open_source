import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScheduleInsights from "./ScheduleInsights";
import { Button } from "@/components/ui/button";
import ScheduleGanttInterface from "./ScheduleGanttInterface";
import CustomDatePicker from "../DatePicker/DatePicker";
import ActivitiesDetailPage from "./ActivityDetailsPage";
import AddNewActivityModal from "./AddNewActivityModal";
import CsvUploadIcon from "./CSVUpload/csvUploadIcon";
import { useScheduleSync } from "./SyncSchedule/useScheduleWithProcore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useStore } from "@/utils/store";
import { useViewStore } from "@/utils/store";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";


function ScheduleUiView({ uiView }: { uiView?: string | string[] }) {
	const { scheduleView, setScheduleView } = useViewStore();
	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const onOpen = () => setIsOpen(true);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const chatRef = useRef<HTMLDivElement>(null);
	const { syncSchedule } = useScheduleSync();
	const { taskToView, setTaskToView, activeProject } = useStore((state) => ({
		taskToView: state.taskToView,
		setTaskToView: state.setTaskToView,
		activeProject: state.activeProject,
	}));
	const searchParams = useSearchParams();
	const router = useRouter();

	const handleTabChange = (value: string) => {
		setScheduleView(value as "list" | "gantt");
	};

	const handleAddActivity = () => {
		onOpen();
	};

	const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

	const handleDrag = (e: any, data: { x: number; y: number }) => {
		setButtonPosition({ x: data.x, y: data.y });
	};

	const nodeRef = useRef(null);

	return (
		<div className="w-full h-full flex flex-col  pt-2 ">
			<SetUseStoreData />
			<AddNewActivityModal isOpen={isOpen} onClose={onClose} />
			<div className=" flex  justify-end gap-8 items-center absolute right-8 z-50  px-2  rounded-lg">
				<div>
					<CustomDatePicker />
				</div>
				<div className="flex gap-4 items-center p-2">
					<CsvUploadIcon />
					<Button
						className="text-xs"
						onClick={handleAddActivity}
						variant="outline"
					>
            + Add Task
					</Button>
					<Button
						className="text-xs"
						onClick={() => syncSchedule()}
						variant="outline"
					>
            Sync Procore
					</Button>
				</div>
			</div>
			<Tabs
				className="flex flex-col h-full  p-4 w-full"
				defaultValue={scheduleView}
				onValueChange={handleTabChange}
				value={scheduleView}
			>
				<TabsList className="grid grid-cols-2 w-48  ">
					<TabsTrigger value="list">List</TabsTrigger>
					<TabsTrigger value="gantt">Gantt</TabsTrigger>
				</TabsList>
				<TabsContent className="flex h-full gap-2  " value="list">
					<div className=" flex-stretch w-full p-4 ">
						<div>
							<ScheduleInsights />
						</div>
					</div>
				</TabsContent>
				<TabsContent className=" w-[calc(100vw-70px)] " value="gantt">
					<div className="p-4">
						<div>
							<ScheduleGanttInterface />
						</div>
					</div>
				</TabsContent>
			</Tabs>
			<div
				className={`fixed z-50 right-0 h-full w-3/4 max-w-2xl bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
					taskToView ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<Card className="h-full">
					<CardHeader className="flex flex-row justify-between items-center">
						<CardTitle className="text-3xl">Task Details</CardTitle>
						<Button
							onClick={() => setTaskToView(null)}
							size="icon"
							variant="ghost"
						>
							<X className="h-6 w-6" />
						</Button>
					</CardHeader>
					<CardContent>
						<ActivitiesDetailPage />
					</CardContent>
				</Card>
			</div>
			{/* <Draggable
				bounds="parent"
				nodeRef={nodeRef}
				onStop={handleDrag}
				position={buttonPosition}
			>
				<div className="fixed bottom-4 right-4 z-50" ref={nodeRef}>
					<ChatButton
						fixed={false}
						isOpen={isChatOpen}
						onClick={() => setIsChatOpen(!isChatOpen)}
						openText="Update schedule"
						title={
							isChatOpen
								? "Close chat assistant"
								: "Chat with Flowlly AI about schedule"
						}
					/>
				</div>
			</Draggable> */}
			{(isChatOpen || isClosing) && (
				<div
					className={`fixed bottom-2 right-4 w-[calc(100vw-200px)] z-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-opacity duration-300 ${
						isClosing ? "opacity-0" : "opacity-100"
					}`}
					ref={chatRef}
				>
					{activeProject && (
						<PlatformChatComponent
							chatTarget="schedule"
							folderId={activeProject?.project_id}
							
						/>
					)}
					<div className="fixed p-2 z-50 top-3 ">
						<Button
							onClick={() => {
								setIsClosing(true);
								setTimeout(() => {
									setIsChatOpen(false);
									setIsClosing(false);
								}, 300);
							}}
							size="icon"
							variant="outline"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default ScheduleUiView;


const SetUseStoreData = (): React.ReactNode => {
	const {
		session,
		activeProject,
		scheduleDate,
		scheduleProbability,
		setUserActivities,
	} = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
		scheduleDate: state.scheduleDate,
		scheduleProbability: state.scheduleProbability,
		setUserActivities: state.setUserActivities,
	}));

	const { data: activities, isSuccess } = useQuery({
		queryKey: [
			"activityList",
			session,
			activeProject,
			scheduleDate,
			scheduleProbability,
		],
		queryFn: () => {
			if (!session || !activeProject) {
				return Promise.reject("Set session first !");
			}
			const date = getCurrentDateFormatted(scheduleDate || new Date());
			return getActivities(
				session,
				activeProject.project_id,
				date,
				scheduleProbability,
			);
		},
		enabled: !!session?.access_token && !!activeProject?.project_id,
	});

	useEffect(() => {
		if (isSuccess && activities && activities.length > 0) {
			setUserActivities(activities);
		} else if (isSuccess && activities && activities.length === 0) {
			setUserActivities([]);
		}
	}, [activities, isSuccess, setUserActivities]);

	return <></>;
};