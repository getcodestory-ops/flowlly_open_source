import React, { useState, useRef } from "react";
import { Calendar, Clock, MessageSquare, FileText, Users } from "lucide-react";
import { useWorkflow } from "@/hooks/useWorkflow";
import { Input } from "@/components/ui/input";

interface DistributionFlowProps {
	sendAgendaDays: string;
	setSendAgendaDays: (days: string) => void;
	wrapUpHours: string;
	setWrapUpHours: (hours: string) => void;
	allowCommentsHours: string;
	setAllowCommentsHours: (hours: string) => void;
}

export const DistributionFlow: React.FC<DistributionFlowProps> = ({
	sendAgendaDays,
	setSendAgendaDays,
	wrapUpHours,
	setWrapUpHours,
	allowCommentsHours,
	setAllowCommentsHours,
}) => {
	const { currentGraph } = useWorkflow();

	// Get actual meeting information
	const selectedDays = currentGraph?.event_schedule?.schedule?.day || [];
	const meetingTime = currentGraph?.metadata?.time || "";
	const frequency = currentGraph?.metadata?.frequency || "weekly";

	// Values are already in days (no conversion needed)
	const wrapUpDays = wrapUpHours;
	const allowCommentsDays = allowCommentsHours;

	// Get next meeting date based on selected days
	const getNextMeetingDate = () => {
		if (selectedDays.length === 0) return new Date();
		
		const today = new Date();
		const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
		
		// Find the next occurrence of any selected day
		let daysUntilMeeting = 7; // Default to next week if no match
		
		for (let i = 0; i < 7; i++) {
			const checkDay = (currentDay + i) % 7;
			if (selectedDays.includes(checkDay)) {
				daysUntilMeeting = i === 0 ? 7 : i; // If today, use next week
				break;
			}
		}
		
		const meetingDate = new Date(today);
		meetingDate.setDate(today.getDate() + daysUntilMeeting);
		return meetingDate;
	};

	const meetingDate = getNextMeetingDate();

	// Format meeting date for display
	const formatMeetingDate = () => {
		const today = new Date();
		const diffTime = meetingDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Tomorrow";
		if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
		
		const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return dayNames[meetingDate.getDay()];
	};

	// Format duration in days
	const formatDuration = (days: string, type: "before" | "after") => {
		const num = parseInt(days);
		if (num === 1) {
			return "1 day";
		} else {
			return `${num} days`;
		}
	};

	// Timeline calculations - use actual meeting day position (2 weeks view)
	const today = new Date();
	const meetingDay = Math.ceil((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
	const maxDays = 14; // Two weeks
	const timelineCenter = 7; // Meeting positioned in center of 2-week view
	
	// Calculate positions based on actual days
	const sendAgendaDay = Math.max(0, timelineCenter - parseInt(sendAgendaDays));
	const wrapUpDay = Math.max(0, timelineCenter - parseInt(wrapUpDays));
	const actualMeetingDay = timelineCenter; // Fixed center position
	const commentsEndDay = Math.min(maxDays, timelineCenter + parseInt(allowCommentsDays));
	
	// Convert to percentages for timeline
	const sendAgendaPos = (sendAgendaDay / maxDays) * 100;
	const wrapUpPos = (wrapUpDay / maxDays) * 100;
	const meetingPos = (actualMeetingDay / maxDays) * 100;
	const commentsEndPos = (commentsEndDay / maxDays) * 100;

	// Format day labels based on actual dates
	const getDayLabel = (dayIndex: number) => {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const targetDate = new Date(today);
		targetDate.setDate(today.getDate() + dayIndex - timelineCenter + meetingDay);
		return days[targetDate.getDay()];
	};

	const timelineEvents = [
		{
			id: "send-agenda",
			position: sendAgendaPos,
			icon: FileText,
			color: "blue",
		},
		{
			id: "agenda-deadline",
			position: wrapUpPos,
			icon: Clock,
			color: "amber",
		},
		{
			id: "meeting",
			position: meetingPos,
			icon: Users,
			color: "green",
		},
		{
			id: "comments-end",
			position: commentsEndPos,
			icon: MessageSquare,
			color: "purple",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-1">Meeting Workflow</h3>
				<p className="text-sm text-gray-600">Set up your meeting timeline and deadlines</p>
			</div>
			{/* Input Controls - New Layout */}
			<div className="space-y-2  pb-4">
				{/* Send Agenda */}
				<div className="flex items-center gap-3  rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 p-1 bg-blue-500 border-blue-600 text-white rounded-full border  flex items-center justify-center">
							<FileText className="w-4 h-4 text-white" />
						</div>
						<span className="text-xs font-medium text-gray-700 min-w-0 flex-1">Send agenda  </span>
					</div>
					<div className="flex items-center gap-2">
						<Input
							className="w-12 h-6 text-center text-sm"
							max="7"
							min="1"
							onChange={(e) => setSendAgendaDays(e.target.value)}
							type="number"
							value={sendAgendaDays}
						/>
						<span className="text-xs text-gray-600 min-w-fit"> days before meeting</span>
					</div>
				</div>
				<div className="flex items-center gap-3  rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 p-1 bg-amber-500 border-amber-600 text-white rounded-full border  flex items-center justify-center">
							<Clock className="w-4 h-4 text-white" />
						</div>
						<span className="text-xs font-medium text-gray-700 min-w-0 flex-1">Agenda update deadline</span>
					</div>
					<div className="flex items-center gap-2">
						<Input
							className="w-12 h-6 text-center text-sm"
							max="3"
							min="1"
							onChange={(e) => setWrapUpHours(e.target.value)}
							type="number"
							value={wrapUpHours}
						/>
						<span className="text-xs text-gray-600 min-w-fit"> days before meeting</span>
					</div>
				</div>
				<div className="flex items-center gap-1  rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 p-1 bg-green-500 border-green-600 text-white rounded-full border  flex items-center justify-center">
							<Users className="w-4 h-4 text-white" />
						</div>
						<span className="text-xs font-medium text-gray-700 min-w-0 flex-1">Meeting</span>
					</div>
					<span className="text-xs text-gray-600 font-medium">
						{formatMeetingDate()}{meetingTime ? ` at ${meetingTime}` : ""}
					</span>
				</div>
				<div className="flex items-center gap-3 rounded-lg">
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 p-1 bg-purple-500 border-purple-600 text-white rounded-full border  flex items-center justify-center">
							<MessageSquare className="w-4 h-4 text-white" />
						</div>
						<span className="text-xs font-medium text-gray-700 min-w-0 flex-1">Meeting comment deadline</span>
					</div>
					<div className="flex items-center gap-2">
						<Input
							className="w-12 h-6 text-center text-sm"
							max="5"
							min="1"
							onChange={(e) => setAllowCommentsHours(e.target.value)}
							type="number"
							value={allowCommentsHours}
						/>
						<span className="text-xs text-gray-600 min-w-fit"> days after meeting</span>
					</div>
				</div>
			</div>
			{/* Timeline Visualization - 2 weeks */}
			<div className="relative">
				{/* Week labels */}
				<div className="flex justify-between text-xs text-gray-400 mb-4 px-8">
					{Array.from({ length: 15 }, (_, i) => (
						<div className="text-center" key={i}>
							{i % 2 === 0 && getDayLabel(i)}
						</div>
					))}
				</div>
				{/* Timeline line */}
				<div className="relative h-2 bg-gray-200 rounded-full mb-8 mx-8">
					{/* Progress segments */}
					<div 
						className="absolute top-0 left-0 h-full bg-blue-200 rounded-l-full"
						style={{ width: `${meetingPos}%` }}
					/>
					<div 
						className="absolute top-0 h-full bg-green-200"
						style={{ 
							left: `${meetingPos}%`, 
							width: `${Math.min(commentsEndPos - meetingPos, 100 - meetingPos)}%`,
						}}
					/>
					{/* Timeline events - no labels */}
					{timelineEvents.map((event) => {
						const Icon = event.icon;
						const colorClasses = {
							blue: "bg-blue-500 border-blue-600 text-white",
							amber: "bg-amber-500 border-amber-600 text-white",
							green: "bg-green-500 border-green-600 text-white",
							purple: "bg-purple-500 border-purple-600 text-white",
							gray: "bg-gray-400 border-gray-500 text-white",
						};

						return (
							<div
								className="absolute transform -translate-x-1/2"
								key={event.id}
								style={{ left: `${event.position}%` }}
							>
								{/* Event marker only */}
								<div
									className={`
										w-8 h-8 rounded-full border-2 flex items-center justify-center -mt-3
										${colorClasses[event.color as keyof typeof colorClasses]}
										shadow-sm
									`}
								>
									<Icon className="w-4 h-4" />
								</div>
							</div>
						);
					})}
				</div>
				{/* Next meeting indicator */}
				{frequency !== "once" && (
					<div className="text-center mt-4 pt-4 border-t border-gray-100">
						<div className="inline-flex items-center gap-2 text-sm text-gray-600">
							<Calendar className="w-4 h-4" />
							<span>Next meeting: {frequency === "weekly" ? "1 week later" : `Every ${frequency}`}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}; 