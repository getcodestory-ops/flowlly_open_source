"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ComputerState, ComputerEvent } from "@/types/computerEvents";

const INITIAL_FILES = [
	{
		name: "main.py",
		path: "/workspace/main.py",
		type: "file" as const,
		size: 1024,
		lastModified: Date.now() - 300000,
		isNew: false,
		isModified: false,
	},
	{
		name: "requirements.txt",
		path: "/workspace/requirements.txt", 
		type: "file" as const,
		size: 256,
		lastModified: Date.now() - 600000,
		isNew: false,
		isModified: false,
	},
	{
		name: "data",
		path: "/workspace/data",
		type: "directory" as const,
		lastModified: Date.now() - 900000,
		isNew: false,
		isModified: false,
	},
	{
		name: "config.json",
		path: "/workspace/config.json",
		type: "file" as const,
		size: 512,
		lastModified: Date.now() - 1200000,
		isNew: false,
		isModified: false,
	},
];

const INITIAL_STATE: ComputerState = {
	isRunning: false,
	sandbox_id: null,
	currentDirectory: "/workspace",
	runningProcesses: [],
	fileSystem: INITIAL_FILES,
	recentActivity: [],
	systemInfo: {
		cpu: "2 vCPU",
		memory: "4GB RAM",
		storage: "20GB SSD",
		environment: "Ubuntu 22.04",
	},
};

export const useComputerState = () => {
	const [computerState, setComputerState] = useState<ComputerState>(INITIAL_STATE);
	const eventQueueRef = useRef<ComputerEvent[]>([]);
	const processingRef = useRef(false);

	// Process event queue
	const processEventQueue = useCallback(() => {
		if (processingRef.current || eventQueueRef.current.length === 0) {
			return;
		}

		processingRef.current = true;
		const event = eventQueueRef.current.shift()!;

		setComputerState((prevState) => {
			const newState = { ...prevState };
      
			// Add to recent activity (keep last 50 events)
			newState.recentActivity = [...prevState.recentActivity.slice(-49), event];

			switch (event.action) {
				case "sandbox_started":
					newState.isRunning = true;
					newState.sandbox_id = event.sandbox_id;
					if ((event as any).resources) {
						newState.systemInfo = {
							...newState.systemInfo!,
							...(event as any).resources,
						};
					}
					break;

				case "sandbox_stopped":
					newState.isRunning = false;
					newState.runningProcesses = [];
					break;

				case "file_created":
					const createEvent = event as any;
					const newFile = {
						name: createEvent.file_name,
						path: createEvent.file_path,
						type: createEvent.file_type === "directory" ? "directory" as const : "file" as const,
						size: createEvent.file_size || 0,
						lastModified: event.timestamp,
						isNew: true,
						isModified: false,
					};
					newState.fileSystem = [...prevState.fileSystem, newFile];
          
					// Remove isNew flag after 3 seconds
					setTimeout(() => {
						setComputerState((state) => ({
							...state,
							fileSystem: state.fileSystem.map((f) => 
								f.path === newFile.path ? { ...f, isNew: false } : f,
							),
						}));
					}, 3000);
					break;

				case "file_edited":
					const editEvent = event as any;
					newState.fileSystem = prevState.fileSystem.map((file) => 
						file.path === editEvent.file_path
							? { 
								...file, 
								lastModified: event.timestamp,
								isModified: true,
								isNew: false,
							}
							: file,
					);
          
					// Remove isModified flag after 3 seconds
					setTimeout(() => {
						setComputerState((state) => ({
							...state,
							fileSystem: state.fileSystem.map((f) => 
								f.path === editEvent.file_path ? { ...f, isModified: false } : f,
							),
						}));
					}, 3000);
					break;

				case "process_started":
					const processEvent = event as any;
					const newProcess = {
						name: processEvent.process_name,
						pid: processEvent.pid || Math.floor(Math.random() * 10000) + 1000,
						command: processEvent.command || processEvent.process_name,
						startTime: event.timestamp,
					};
					newState.runningProcesses = [...prevState.runningProcesses, newProcess];
					break;

				case "process_stopped":
					const stopEvent = event as any;
					newState.runningProcesses = prevState.runningProcesses.filter(
						(p) => p.pid !== stopEvent.pid && p.name !== stopEvent.process_name,
					);
					break;

				case "command_executed":
					const cmdEvent = event as any;
					if (cmdEvent.working_directory) {
						newState.currentDirectory = cmdEvent.working_directory;
					}
					break;

				case "terminal_output":
					// Terminal output events are handled by the WindowsDesktop component
					// No state changes needed here, just pass through to recent activity
					break;
			}

			return newState;
		});

		processingRef.current = false;
    
		// Process next event after a short delay
		setTimeout(() => {
			processEventQueue();
		}, 100);
	}, []);

	// Add event to queue
	const handleEvent = useCallback((event: ComputerEvent) => {
		eventQueueRef.current.push(event);
		processEventQueue();
	}, [processEventQueue]);

	// Reset computer state
	const resetComputer = useCallback(() => {
		setComputerState(INITIAL_STATE);
		eventQueueRef.current = [];
		processingRef.current = false;
	}, []);

	// Simulate computer startup
	const startComputer = useCallback((sandbox_id: string) => {
		const startEvent: ComputerEvent = {
			action: "sandbox_started",
			timestamp: Date.now(),
			sandbox_id,
			environment: "Ubuntu 22.04",
			resources: {
				cpu: "2 vCPU",
				memory: "4GB RAM", 
				storage: "20GB SSD",
			},
		};
		handleEvent(startEvent);
	}, [handleEvent]);

	// Simulate computer shutdown
	const stopComputer = useCallback(() => {
		if (computerState.sandbox_id) {
			const stopEvent: ComputerEvent = {
				action: "sandbox_stopped",
				timestamp: Date.now(),
				sandbox_id: computerState.sandbox_id,
				reason: "User requested shutdown",
			};
			handleEvent(stopEvent);
		}
	}, [computerState.sandbox_id, handleEvent]);

	// Auto-process event queue
	useEffect(() => {
		const interval = setInterval(() => {
			processEventQueue();
		}, 200);
    
		return () => clearInterval(interval);
	}, [processEventQueue]);

	return {
		computerState,
		handleEvent,
		resetComputer,
		startComputer,
		stopComputer,
	};
};
