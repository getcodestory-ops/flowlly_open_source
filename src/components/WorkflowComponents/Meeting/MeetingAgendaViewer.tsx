import React from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import type { NodeData } from "../types";

interface MeetingAgendaViewerProps {
	agendaNode?: NodeData;
}

// Helper component for no data state
const NoDataAvailable: React.FC<{ message: string }> = ({ message }) => (
	<div className="flex items-center justify-center h-full text-gray-500">
		<div className="text-center">
			<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
			<p className="text-lg font-medium mb-2">No Agenda Available</p>
			<p className="text-sm">{message}</p>
		</div>
	</div>
);

// Helper component for error state
const ErrorState: React.FC<{ message: string }> = ({ message }) => (
	<div className="flex items-center justify-center h-full text-red-500">
		<div className="text-center">
			<AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-300" />
			<p className="text-lg font-medium mb-2">Error Loading Agenda</p>
			<p className="text-sm text-gray-600">{message}</p>
		</div>
	</div>
);

// Helper component for loading state
const LoadingState: React.FC = () => (
	<div className="flex items-center justify-center h-full text-gray-500">
		<div className="text-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
			<p className="text-sm">Loading meeting agenda...</p>
		</div>
	</div>
);

export const MeetingAgendaViewer: React.FC<MeetingAgendaViewerProps> = ({
	agendaNode,
}) => {
	// Check if agenda node exists
	if (!agendaNode) {
		return <NoDataAvailable message="Meeting agenda has not been created yet" />;
	}

	// Check if agenda node has output
	if (!agendaNode.output) {
		return <NoDataAvailable message="Agenda content is not available" />;
	}

	// Check if agenda node has resource_id
	if (!agendaNode.output.resource_id) {
		// Handle different output formats
		if (typeof agendaNode.output === "string") {
			return (
				<div className="h-full p-6 overflow-auto">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-6">
							<Calendar className="h-6 w-6 text-blue-600" />
							<h2 className="text-2xl font-semibold text-gray-900">Next Meeting Agenda</h2>
						</div>
						<div className="bg-white border rounded-lg p-6">
							<div className="prose max-w-none">
								<pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
									{agendaNode.output}
								</pre>
							</div>
						</div>
					</div>
				</div>
			);
		} else if (agendaNode.output && typeof agendaNode.output === "object") {
			return (
				<div className="h-full p-6 overflow-auto">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-6">
							<Calendar className="h-6 w-6 text-blue-600" />
							<h2 className="text-2xl font-semibold text-gray-900">Next Meeting Agenda</h2>
						</div>
						<div className="bg-white border rounded-lg p-6">
							<div className="text-sm text-gray-700">
								<pre className="whitespace-pre-wrap font-sans">
									{JSON.stringify(agendaNode.output, null, 2)}
								</pre>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return <ErrorState message="Agenda data format is not supported" />;
		}
	}

	// Validate resource_id format
	if (typeof agendaNode.output.resource_id !== "string" || !agendaNode.output.resource_id.trim()) {
		return <ErrorState message="Invalid resource ID for meeting agenda" />;
	}

	// Check agenda node status for loading states
	if (agendaNode.status === "pending" || agendaNode.status === "running") {
		return <LoadingState />;
	}

	if (agendaNode.status === "failed") {
		return <ErrorState message="Failed to generate meeting agenda. Please try again." />;
	}

	// Render with ResourceTextViewer
	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b bg-white">
				<div className="flex items-center gap-2">
					<Calendar className="h-6 w-6 text-blue-600" />
					<h2 className="text-xl font-semibold text-gray-900">Next Meeting Agenda</h2>
				</div>
				<p className="text-sm text-gray-600 mt-1">
					Automatically generated based on previous meeting discussions
				</p>
			</div>
			{/* Content */}<div className="flex-1 min-h-0 p-6">
				<div className="h-full border rounded-lg overflow-hidden">
					<ResourceTextViewer 
						resource_id={agendaNode.output.resource_id as string}
						showComments
					/>
				</div>
			</div>
		</div>
	);
};

export default MeetingAgendaViewer;