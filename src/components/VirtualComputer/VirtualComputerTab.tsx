"use client";

import React, { useEffect, useState } from "react";
import { useComputerState } from "./useComputerState";
import WindowsDesktop from "./WindowsDesktop";
import { ComputerEvent } from "@/types/computerEvents";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Monitor, Settings, ChevronUp, ChevronDown } from "lucide-react";
import ComputerEventSimulator from "./ComputerEventSimulator";
import { useChatStore } from "@/hooks/useChatStore";

interface VirtualComputerTabProps {
  sandbox_id: string;
  title?: string;
  initialTerminalExpanded?: boolean;
}

const VirtualComputerTab: React.FC<VirtualComputerTabProps> = ({
	sandbox_id,
	title = "Virtual Computer",
	initialTerminalExpanded = false,
}) => {
	const { computerState, handleEvent, resetComputer, startComputer, stopComputer } = useComputerState();
	const { setVirtualComputerEventHandler } = useChatStore();
	const [isInitialized, setIsInitialized] = useState(false);
	const [showSimulator, setShowSimulator] = useState(false);

	// Initialize computer when component mounts
	useEffect(() => {
		if (sandbox_id && !isInitialized) {
			// Simulate computer startup (works for both real and fake sandbox IDs)
			startComputer(sandbox_id);
			setIsInitialized(true);
		}
	}, [sandbox_id, isInitialized, startComputer]);

	// Register event handler with chat store for external components to send events
	useEffect(() => {
		setVirtualComputerEventHandler(handleEvent);
		return () => {
			setVirtualComputerEventHandler(null);
		};
	}, [handleEvent, setVirtualComputerEventHandler]);

	// Handle computer events from stream (this would be connected to the stream)
	const handleComputerEvent = (event: ComputerEvent): void => {
		handleEvent(event);
	};

	return (
		<div className="h-full flex flex-col bg-gray-50 overflow-hidden">
			{/* Compact Header */}
			{/* <div className="flex items-center justify-between p-2 border-b bg-white flex-shrink-0">
				<div className="flex items-center gap-2">
					<Monitor className="w-4 h-4 text-blue-600" />
					<h2 className="text-sm font-semibold text-gray-900">{title}</h2>
					<div className="text-xs text-gray-500">
						{sandbox_id.startsWith("fake_") ? "Demo Mode" : `${sandbox_id.slice(0, 8)}...`}
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						className="text-blue-600 hover:text-blue-700 h-7 px-2 text-xs"
						onClick={() => setShowSimulator(!showSimulator)}
						size="sm"
						variant="outline"
					>
						<Settings className="w-3 h-3 mr-1" />
						{showSimulator ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
					</Button>
					{computerState.isRunning ? (
						<Button
							className="text-red-600 hover:text-red-700 h-7 px-2 text-xs"
							onClick={stopComputer}
							size="sm"
							variant="outline"
						>
							<Square className="w-3 h-3 mr-1" />
							Stop
						</Button>
					) : (
						<Button
							className="text-green-600 hover:text-green-700 h-7 px-2 text-xs"
							onClick={() => startComputer(sandbox_id)}
							size="sm"
							variant="outline"
						>
							<Play className="w-3 h-3 mr-1" />
							Start
						</Button>
					)}
					<Button
						className="text-gray-600 hover:text-gray-700 h-7 px-2 text-xs"
						onClick={resetComputer}
						size="sm"
						variant="outline"
					>
						<RotateCcw className="w-3 h-3 mr-1" />
						Reset
					</Button>
				</div>
			</div> */}
			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Event Simulator - Collapsible */}
				{showSimulator && (
					<div className="flex-shrink-0 max-h-64 overflow-y-auto border-b">
						<ComputerEventSimulator
							className="border-0"
							onEventGenerated={handleEvent}
							sandbox_id={sandbox_id}
						/>
					</div>
				)}
				<div className="flex-1 overflow-auto">
					<WindowsDesktop
						className="min-h-full"
						computerState={computerState}
						initialTerminalExpanded={initialTerminalExpanded}
						onEventReceived={handleComputerEvent}
					/>
				</div>
			</div>
			<div className="p-1 bg-gray-100 border-t text-xs text-gray-600 flex justify-between items-center flex-shrink-0">
				<div className="flex items-center gap-3">
					<span>Status: {computerState.isRunning ? "Running" : "Stopped"}</span>
					<span>Files: {computerState.fileSystem.length}</span>
					<span>Processes: {computerState.runningProcesses.length}</span>
				</div>
				<div>
					Events: {computerState.recentActivity.length}
				</div>
			</div>
		</div>
	);
};

export default VirtualComputerTab;
