import React from "react";
import { Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectEvents } from "@/components/WorkflowComponents/types";

interface MeetingsListProps {
	meetings: ProjectEvents["project_events"][] | null;
	onMeetingSelect: (meetingId: string) => void;
	className?: string;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({
	meetings,
	onMeetingSelect,
	className = "",
}) => {
	if (!meetings || meetings.length === 0) {
		return (
			<div className="text-center py-12 px-6">
				<div className="mb-4">
					<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
						<Calendar className="h-6 w-6 text-gray-400" />
					</div>
				</div>
				<h3 className="text-sm font-medium text-gray-900 mb-2">No meetings created yet</h3>
				<p className="text-xs text-gray-500 mb-4">Create your first meeting to get started</p>
			</div>
		);
	}

	const filteredMeetings = meetings.filter((graph) => graph.event_type === "meeting");

	// Original WorkflowPanel style
	return (
		<div className={`h-full flex-1 ${className}`}>
			<ScrollArea className="h-full px-6">
				<div className="py-6">
					{filteredMeetings && filteredMeetings.reverse().map((meeting, index, array) => {
						// Group meetings by date
						const date = new Date(meeting.created_at);
						const today = new Date();
						const yesterday = new Date(today);
						yesterday.setDate(yesterday.getDate() - 1);
					
						let dateLabel = "";
						if (index === 0 || (index > 0 && new Date(array[index - 1].created_at).toDateString() !== date.toDateString())) {
							if (date.toDateString() === today.toDateString()) {
								dateLabel = "Today";
							} else if (date.toDateString() === yesterday.toDateString()) {
								dateLabel = "Yesterday";
							} else {
								dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
							}
						}

						return (
							<div className="w-80" key={meeting.id}>
								{dateLabel && (
									<div className="text-xs font-medium text-gray-500 m-3 first:mt-0 w-32">
										{dateLabel}
									</div>
								)}
								<div
									className="group cursor-pointer p-4 rounded-lg mb-2 transition-all duration-200 hover:bg-white hover:shadow-sm"
									onClick={() => onMeetingSelect(meeting.id)}
								>
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-gray-200">
											<Calendar className="h-4 w-4 text-gray-600" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
												{meeting.name}
											</h3>
											{meeting.description && (
												<p className="text-xs text-gray-500 mt-1 line-clamp-2">
													{meeting.description}
												</p>
											)}
											<div className="flex items-center justify-between mt-2">
												<div className="flex items-center gap-2 text-xs text-gray-500">
													{meeting.metadata?.frequency && (
														<span className="capitalize">
															{meeting.metadata.frequency}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
};

export default MeetingsList;