"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Monitor,
	Terminal,
	FileText,
	Folder,
	Play,
	Square,
	Search,
	Wifi,
	Battery,
	Volume2,
	Settings,
	Chrome,
	Code,
	Database,
	Globe,
	AlertCircle,
	CheckCircle,
	Clock,
	Cpu,
	HardDrive,
	MemoryStick,
} from "lucide-react";
import { ComputerState, ComputerEvent, AnimationState, AnimationType } from "@/types/computerEvents";
import { cn } from "@/lib/utils";

interface VirtualComputerProps {
  computerState: ComputerState;
  onEventReceived?: (event: ComputerEvent) => void;
  className?: string;
}

const VirtualComputer: React.FC<VirtualComputerProps> = ({
	computerState,
	onEventReceived,
	className,
}) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [activeAnimations, setActiveAnimations] = useState<AnimationState[]>([]);
	const [terminalOutput, setTerminalOutput] = useState<string[]>([
		"Welcome to Flowlly Virtual Computer",
		"System initialized successfully",
		"Ready for operations...",
	]);
	const terminalRef = useRef<HTMLDivElement>(null);

	// Update current time
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Handle new events and trigger animations
	useEffect(() => {
		if (computerState.recentActivity.length > 0) {
			const latestEvent = computerState.recentActivity[computerState.recentActivity.length - 1];
			triggerAnimation(latestEvent);
			updateTerminalOutput(latestEvent);
		}
	}, [computerState.recentActivity]);

	const triggerAnimation = (event: ComputerEvent) => {
		let animationType: AnimationType;
		let target = "";

		switch (event.action) {
			case "file_created":
				animationType = "file-created";
				target = (event as any).file_name;
				break;
			case "file_edited":
				animationType = "file-edited";
				target = (event as any).file_name;
				break;
			case "command_executed":
				animationType = "command-executed";
				target = (event as any).command;
				break;
			case "google_search":
			case "project_docs_search":
				animationType = "search-performed";
				target = (event as any).query;
				break;
			case "process_started":
				animationType = "process-started";
				target = (event as any).process_name;
				break;
			case "error":
				animationType = "error-occurred";
				target = (event as any).error_message;
				break;
			default:
				animationType = "loading";
		}

		const newAnimation: AnimationState = {
			type: animationType,
			target,
			duration: 2000,
			startTime: Date.now(),
		};

		setActiveAnimations((prev) => [...prev, newAnimation]);

		// Remove animation after duration
		setTimeout(() => {
			setActiveAnimations((prev) => prev.filter((anim) => anim.startTime !== newAnimation.startTime));
		}, newAnimation.duration);
	};

	const updateTerminalOutput = (event: ComputerEvent) => {
		let output = "";
		const timestamp = new Date(event.timestamp).toLocaleTimeString();

		switch (event.action) {
			case "sandbox_started":
				output = `[${timestamp}] 🚀 Sandbox started (ID: ${event.sandbox_id})`;
				break;
			case "file_created":
				output = `[${timestamp}] 📄 Created: ${(event as any).file_name}`;
				break;
			case "file_edited":
				output = `[${timestamp}] ✏️  Edited: ${(event as any).file_name}`;
				break;
			case "command_executed":
				output = `[${timestamp}] 💻 Executed: ${(event as any).command}`;
				break;
			case "google_search":
				output = `[${timestamp}] 🔍 Google search: "${(event as any).query}"`;
				break;
			case "project_docs_search":
				output = `[${timestamp}] 📚 Docs search: "${(event as any).query}"`;
				break;
			case "process_started":
				output = `[${timestamp}] ▶️  Started: ${(event as any).process_name}`;
				break;
			case "error":
				output = `[${timestamp}] ❌ Error: ${(event as any).error_message}`;
				break;
			default:
				output = `[${timestamp}] ℹ️  ${event.action}: ${event.sandbox_id}`;
		}

		setTerminalOutput((prev) => [...prev.slice(-20), output]);
	};

	// Auto-scroll terminal to bottom
	useEffect(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [terminalOutput]);

	const getFileIcon = (fileName: string) => {
		const ext = fileName.split(".").pop()
			?.toLowerCase();
		switch (ext) {
			case "py":
				return <Code className="w-4 h-4 text-blue-500" />;
			case "js":
			case "ts":
				return <Code className="w-4 h-4 text-yellow-500" />;
			case "json":
				return <Database className="w-4 h-4 text-green-500" />;
			case "md":
				return <FileText className="w-4 h-4 text-gray-500" />;
			default:
				return <FileText className="w-4 h-4 text-gray-400" />;
		}
	};

	const getStatusColor = () => {
		if (!computerState.isRunning) return "bg-red-500";
		if (computerState.recentActivity.some((e) => e.action === "error")) return "bg-yellow-500";
		return "bg-green-500";
	};

	return (
		<div className={cn("w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 p-6", className)}>
			{/* Laptop Frame */}
			<div className="relative mx-auto max-w-4xl">
				{/* Laptop Screen */}
				<div className="relative bg-black rounded-t-2xl p-4 shadow-2xl border-4 border-gray-700">
					{/* Screen Bezel */}
					<div className="bg-gray-900 rounded-lg p-2 h-[500px] relative overflow-hidden">
						{/* Status Bar */}
						<div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-t-lg text-white text-sm">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
									<span className="text-xs">
										{computerState.isRunning ? "Running" : "Stopped"}
									</span>
								</div>
								{computerState.sandbox_id && (
									<div className="text-xs text-gray-400">
                    ID: {computerState.sandbox_id.slice(0, 8)}...
									</div>
								)}
							</div>
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-1">
									<Wifi className="w-3 h-3" />
									<Battery className="w-3 h-3" />
									<Volume2 className="w-3 h-3" />
								</div>
								<div className="text-xs">
									{currentTime.toLocaleTimeString()}
								</div>
							</div>
						</div>
						{/* Desktop Environment */}
						<div className="flex h-full bg-gradient-to-br from-blue-900 to-purple-900 relative">
							{/* Left Panel - File Explorer */}
							<div className="w-1/3 bg-gray-800 bg-opacity-90 backdrop-blur-sm p-4 overflow-y-auto">
								<div className="flex items-center gap-2 mb-4 text-white">
									<Folder className="w-4 h-4" />
									<span className="text-sm font-medium">File Explorer</span>
								</div>                
								{/* System Info */}
								{computerState.systemInfo && (
									<div className="mb-4 p-3 bg-gray-700 rounded-lg">
										<div className="text-xs text-gray-300 mb-2">System Resources</div>
										<div className="space-y-1 text-xs text-gray-400">
											<div className="flex items-center gap-2">
												<Cpu className="w-3 h-3" />
												<span>{computerState.systemInfo.cpu}</span>
											</div>
											<div className="flex items-center gap-2">
												<MemoryStick className="w-3 h-3" />
												<span>{computerState.systemInfo.memory}</span>
											</div>
											<div className="flex items-center gap-2">
												<HardDrive className="w-3 h-3" />
												<span>{computerState.systemInfo.storage}</span>
											</div>
										</div>
									</div>
								)}
								{/* File System */}
								<div className="space-y-1">
									<AnimatePresence>
										{computerState.fileSystem.map((file, index) => (
											<motion.div
												animate={{ opacity: 1, x: 0, scale: 1 }}
												className={cn(
													"flex items-center gap-2 p-2 rounded text-sm hover:bg-gray-700 transition-colors",
													file.isNew && "bg-green-900 bg-opacity-50",
													file.isModified && "bg-blue-900 bg-opacity-50",
												)}
												exit={{ opacity: 0, x: -20, scale: 0.9 }}
												initial={file.isNew ? { opacity: 0, x: -20, scale: 0.9 } : false}
												key={`${file.path}-${index}`}
												transition={{ duration: 0.3 }}
											>
												{file.type === "directory" ? (
													<Folder className="w-4 h-4 text-blue-400" />
												) : (
													getFileIcon(file.name)
												)}
												<span className="text-gray-300 truncate">{file.name}</span>
												{file.isNew && (
													<motion.div
														animate={{ scale: 1 }}
														className="w-2 h-2 bg-green-400 rounded-full"
														initial={{ scale: 0 }}
													/>
												)}
												{file.isModified && (
													<motion.div
														animate={{ scale: 1 }}
														className="w-2 h-2 bg-blue-400 rounded-full"
														initial={{ scale: 0 }}
													/>
												)}
											</motion.div>
										))}
									</AnimatePresence>
								</div>
								{/* Running Processes */}
								{computerState.runningProcesses.length > 0 && (
									<div className="mt-6">
										<div className="flex items-center gap-2 mb-2 text-white">
											<Play className="w-4 h-4" />
											<span className="text-sm font-medium">Running Processes</span>
										</div>
										<div className="space-y-1">
											{computerState.runningProcesses.map((process, index) => (
												<motion.div
													animate={{ opacity: 1, y: 0 }}
													className="flex items-center gap-2 p-2 bg-gray-700 rounded text-xs text-gray-300"
													initial={{ opacity: 0, y: 10 }}
													key={`${process.pid}-${index}`}
												>
													<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
													<span className="truncate">{process.name}</span>
													<span className="text-gray-500">PID: {process.pid}</span>
												</motion.div>
											))}
										</div>
									</div>
								)}
							</div>
							{/* Right Panel - Terminal */}
							<div className="flex-1 bg-black bg-opacity-80 backdrop-blur-sm p-4">
								<div className="flex items-center gap-2 mb-4 text-white">
									<Terminal className="w-4 h-4" />
									<span className="text-sm font-medium">Terminal</span>
									<div className="flex-1" />
									<div className="text-xs text-gray-400">
										{computerState.currentDirectory}
									</div>
								</div>
								<div 
									className="bg-black rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm"
									ref={terminalRef}
								>
									<AnimatePresence>
										{terminalOutput.map((line, index) => (
											<motion.div
												animate={{ opacity: 1, y: 0 }}
												className="text-green-400 mb-1 leading-relaxed"
												initial={{ opacity: 0, y: 10 }}
												key={index}
												transition={{ duration: 0.2 }}
											>
												{line}
											</motion.div>
										))}
									</AnimatePresence>                  
									{/* Typing cursor */}
									<motion.div
										animate={{ opacity: [1, 0, 1] }}
										className="inline-block w-2 h-4 bg-green-400 ml-1"
										transition={{ duration: 1, repeat: Infinity }}
									/>
								</div>
							</div>
						</div>
						{/* Animation Overlays */}
						<AnimatePresence>
							{activeAnimations.map((animation, index) => (
								<AnimationOverlay
									animation={animation}
									key={`${animation.startTime}-${index}`}
								/>
							))}
						</AnimatePresence>
					</div>
				</div>
				{/* Laptop Base */}
				<div className="bg-gray-700 rounded-b-2xl h-8 shadow-2xl border-4 border-t-0 border-gray-700">
					<div className="flex justify-center items-center h-full">
						<div className="w-16 h-1 bg-gray-600 rounded-full" />
					</div>
				</div>
				{/* Activity Indicators */}
				<div className="absolute top-4 right-4 flex gap-2">
					{computerState.isRunning && (
						<motion.div
							animate={{ scale: [1, 1.1, 1] }}
							className="w-3 h-3 bg-green-400 rounded-full shadow-lg"
							transition={{ duration: 2, repeat: Infinity }}
						/>
					)}
					{activeAnimations.length > 0 && (
						<motion.div
							animate={{ rotate: 360 }}
							className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full"
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

// Animation Overlay Component
const AnimationOverlay: React.FC<{ animation: AnimationState }> = ({ animation }) => {
	const getAnimationIcon = () => {
		switch (animation.type) {
			case "file-created":
				return <FileText className="w-8 h-8 text-green-400" />;
			case "file-edited":
				return <FileText className="w-8 h-8 text-blue-400" />;
			case "command-executed":
				return <Terminal className="w-8 h-8 text-purple-400" />;
			case "search-performed":
				return <Search className="w-8 h-8 text-yellow-400" />;
			case "process-started":
				return <Play className="w-8 h-8 text-green-400" />;
			case "error-occurred":
				return <AlertCircle className="w-8 h-8 text-red-400" />;
			default:
				return <Settings className="w-8 h-8 text-gray-400" />;
		}
	};

	const getAnimationColor = () => {
		switch (animation.type) {
			case "file-created":
			case "process-started":
				return "from-green-500/20 to-green-600/20";
			case "file-edited":
				return "from-blue-500/20 to-blue-600/20";
			case "command-executed":
				return "from-purple-500/20 to-purple-600/20";
			case "search-performed":
				return "from-yellow-500/20 to-yellow-600/20";
			case "error-occurred":
				return "from-red-500/20 to-red-600/20";
			default:
				return "from-gray-500/20 to-gray-600/20";
		}
	};

	return (
		<motion.div
			animate={{ opacity: 1, scale: 1, y: 0 }}
			className={cn(
				"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
				"bg-gradient-to-br backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10",
				getAnimationColor(),
			)}
			exit={{ opacity: 0, scale: 0.5, y: -50 }}
			initial={{ opacity: 0, scale: 0.5, y: 50 }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex flex-col items-center gap-3">
				<motion.div
					animate={{ rotate: [0, 10, -10, 0] }}
					transition={{ duration: 0.5, repeat: 2 }}
				>
					{getAnimationIcon()}
				</motion.div>
				<div className="text-white text-sm font-medium text-center max-w-48">
					{animation.target && (
						<div className="truncate">{animation.target}</div>
					)}
					<div className="text-xs text-gray-300 capitalize">
						{animation.type.replace("-", " ")}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default VirtualComputer;
