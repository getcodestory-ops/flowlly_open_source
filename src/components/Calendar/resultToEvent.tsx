import React from "react";
import { GraphData, EventResult } from "../WorkflowComponents/types";
import { RbcEvent } from "@/types/calendar";
import { Video, FileText, Mail, Save, Mic } from "lucide-react";

// Helper function to get icon components based on available nodes
const getEventIconComponents = (nodes: any[]): JSX.Element[] => {
	if (!nodes || nodes.length <= 2) return [];
	
	const icons: JSX.Element[] = [];
	const nodeIds = nodes.map(node => node.id?.toLowerCase() || "");
	

	if (nodeIds.some(id => id.includes("record") || id.includes("video") || id.includes("meeting"))) {
		// Check if there's actual recording output
		const recordNode = nodes.find(node => 
			node.id?.toLowerCase().includes("record") && 
			node.output && 
			typeof node.output === "object" && 
			node.output.url
		);
		if (recordNode) {
			icons.push(<Video key="video" size={12} className="shrink-0" />);
		}
	}
	
	// Check for transcription
	if (nodeIds.some(id => id.includes("transcribe") || id.includes("transcript"))) {
		const transcriptNode = nodes.find(node => 
			node.id?.toLowerCase().includes("transcribe") && 
			node.status === "completed"
		);
		if (transcriptNode) {
			icons.push(<Mic key="transcript" size={12} className="shrink-0" />);
		}
	}
	
	// Check for minutes/documents
	if (nodeIds.some(id => id.includes("minutes") || id.includes("write_meeting"))) {
		const minutesNode = nodes.find(node => 
			node.id?.toLowerCase().includes("minutes") && 
			node.status === "completed"
		);
		if (minutesNode) {
			icons.push(<FileText key="minutes" size={12} className="shrink-0" />);
		}
	}
	
	// Check for saved documents
	if (nodeIds.some(id => id.includes("save") || id.includes("upload") || id.includes("project_documents"))) {
		const saveNode = nodes.find(node => 
			(node.id?.toLowerCase().includes("save") || node.id?.toLowerCase().includes("upload")) && 
			node.status === "completed"
		);
		if (saveNode) {
			icons.push(<Save key="save" size={12} className="shrink-0" />);
		}
	}
	
	// Check for distribution/email
	if (nodeIds.some(id => id.includes("distribute") || id.includes("email") || id.includes("send"))) {
		const distributeNode = nodes.find(node => 
			node.id?.toLowerCase().includes("distribute") && 
			node.status === "completed"
		);
		if (distributeNode) {
			icons.push(<Mail key="mail" size={12} className="shrink-0" />);
		}
	}
	
	return icons;
};

const eventResultToCalendarEvent = (
	eventResult: EventResult
): RbcEvent | null => {
	if (!eventResult.run_time || !eventResult.timestamp || !eventResult.event_name) return null;
	if ((eventResult.nodes || []).length <= 2) return null;
	const timeString = eventResult.run_time || eventResult.timestamp;

	let eventStart: Date;
	if (timeString.includes('+') || timeString.includes('Z')) {
		eventStart = new Date(timeString);
	} else {
		eventStart = new Date(timeString + 'Z');
	}
	const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
	

	const iconComponents = getEventIconComponents(eventResult.nodes || []);
	const eventName = eventResult.event_name || eventResult.name;
	
	const title = (
		<div className="flex items-center gap-1.5 text-xs font-light">
			<span >{eventName}</span>
			{iconComponents.map((icon) => icon)}
		</div>
	);
	
	return {
		id: eventResult.id,
		title: title,
		start: eventStart,
		end: eventEnd,
		allDay: false,
		resource: eventResult,
		resourceType: "eventResult",
		graphName: eventResult.event_name,
	};
};



export const getCalendarResultViewFromGraphData = (
	meetingEventResults: EventResult[],
): RbcEvent[] => {
	if (!meetingEventResults) return [];

	console.log("meetingEventResults", meetingEventResults);

	
	const events: RbcEvent[] = [];
	
	meetingEventResults.forEach((meetingEventResult) => {
		const resultEvent = eventResultToCalendarEvent(meetingEventResult);
		if (resultEvent) events.push(resultEvent);
	
	});

	return events;
};

