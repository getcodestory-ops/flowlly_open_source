"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleIcon, ExpandIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getNotifications } from "@/api/update_routes";
import { Notification } from "@/types/notification";
import ScheduleEditThroughNotification from "./ScheduleEditThroughNotification";

export default function ScheduleNotifications() {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const { data: notifications } = useQuery({
		queryKey: ["projectNotification", activeProject, session],
		queryFn: () => {
			if (!session || !activeProject)
				return Promise.reject("No session or project");
			return getNotifications(session, activeProject.project_id);
		},
		enabled: !!session && !!activeProject,
	});

	return (
		<ScrollArea className="max-h-[calc(78vh-5rem)] w-full">
			<ScheduleEditThroughNotification
				isOpen={isOpen}
				notification={activeNotification}
				onClose={() => setIsOpen(false)}
			/>
			<div className="space-y-4">
				{notifications?.map((notification: Notification) => (
					<div
						className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100"
						key={notification.id}
					>
						<CircleIcon className="h-4 w-4 text-green-500" />
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="flex-1 justify-start p-0 h-auto font-normal"
										onClick={() => {
											setActiveNotification(notification);
											setIsOpen(true);
										}}
										variant="ghost"
									>
										<span className="text-sm hover:text-blue-500">
											{notification.message}
										</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Click to expand</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<Button
							onClick={() => {
								setActiveNotification(notification);
								setIsOpen(true);
							}}
							size="icon"
							variant="ghost"
						>
							<ExpandIcon className="h-4 w-4" />
							<span className="sr-only">Expand notification</span>
						</Button>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
