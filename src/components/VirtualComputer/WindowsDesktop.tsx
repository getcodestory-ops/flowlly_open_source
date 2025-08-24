"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Terminal,
	FileText,
	Folder,
	Play,
	Search,
	Wifi,
	Volume2,
	Code,
	Database,
	AlertCircle,
	Chrome,
	Settings,
} from "lucide-react";
import { ComputerState, ComputerEvent, AnimationState, AnimationType } from "@/types/computerEvents";
import { cn } from "@/lib/utils";

interface WindowsDesktopProps {
  computerState: ComputerState;
  onEventReceived?: (event: ComputerEvent) => void;
  className?: string;
  initialTerminalExpanded?: boolean;
}

const WindowsDesktop: React.FC<WindowsDesktopProps> = ({
	computerState,
	onEventReceived,
	className,
	initialTerminalExpanded = false,
}) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [activeAnimations, setActiveAnimations] = useState<AnimationState[]>([]);
	const [terminalOutput, setTerminalOutput] = useState<string[]>([
		"Flowlly Construction System [Version 2.1.0]",
		"(c) Flowlly Technologies. All rights reserved.",
		"",
		"C:\\workspace>",
	]);
	const [showBrowser, setShowBrowser] = useState(false);
	const [browserUrl, setBrowserUrl] = useState("https://www.google.com");
	const [searchQuery, setSearchQuery] = useState("");
	const [isTerminalExpanded, setIsTerminalExpanded] = useState(initialTerminalExpanded);
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
				animationType = "search-performed";
				target = (event as any).query;
				setShowBrowser(true);
				setSearchQuery((event as any).query);
				setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent((event as any).query)}`);
				// Auto-close browser after 3 seconds
				setTimeout(() => {
					setShowBrowser(false);
				}, 3000);
				break;
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
				output = `[${timestamp}] System initialized successfully`;
				break;
			case "file_created":
				output = `[${timestamp}] Created file: ${(event as any).file_name}`;
				break;
			case "file_edited":
				output = `[${timestamp}] Modified: ${(event as any).file_name}`;
				break;
			case "command_executed":
				output = `[${timestamp}] > ${(event as any).command}`;
				if ((event as any).output) {
					output += `\n${(event as any).output}`;
				}
				break;
			case "google_search":
				output = `[${timestamp}] Opening browser for: "${(event as any).query}"`;
				break;
			case "project_docs_search":
				output = `[${timestamp}] Searching documentation: "${(event as any).query}"`;
				break;
			case "process_started":
				output = `[${timestamp}] Started process: ${(event as any).process_name}`;
				break;
			case "error":
				output = `[${timestamp}] ERROR: ${(event as any).error_message}`;
				break;
			case "terminal_output":
				// For terminal output events, use the content directly without timestamp
				const terminalEvent = event as any;
				output = terminalEvent.content;
				break;
			default:
				output = `[${timestamp}] ${event.action}`;
		}

		setTerminalOutput((prev) => [...prev.slice(-15), output]);
	};

	// Auto-scroll terminal to bottom when new content is added
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
				return <Code className="w-10 h-10 text-blue-600" />;
			case "js":
			case "ts":
				return <Code className="w-10 h-10 text-yellow-600" />;
			case "json":
				return <Database className="w-10 h-10 text-green-600" />;
			case "md":
				return <FileText className="w-10 h-10 text-gray-600" />;
			case "txt":
				return <FileText className="w-10 h-10 text-blue-500" />;
			default:
				return <FileText className="w-10 h-10 text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		if (!computerState.isRunning) return "bg-red-500";
		if (computerState.recentActivity.some((e) => e.action === "error")) return "bg-yellow-500";
		return "bg-green-500";
	};

	return (
		<div className={cn("w-full h-full flex flex-col", className)}>
			{/* Desktop Container with Bezels */}
			<div className="flex-1 bg-white rounded-lg shadow-2xl border-4 border-gray-600 overflow-hidden flex flex-col">
				{/* Windows Taskbar */}
				<div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between flex-shrink-0">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
							<span className="text-xs text-gray-700">
								{computerState.isRunning ? "Computer Running" : "Computer Stopped"}
							</span>
						</div>
						{computerState.sandbox_id && (
							<div className="text-xs text-gray-500">
              Workspace: {computerState.sandbox_id.startsWith("fake_") ? "Demo" : computerState.sandbox_id.slice(0, 8)}
							</div>
						)}
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-gray-600">
							<Wifi className="w-4 h-4" />
							<Volume2 className="w-4 h-4" />
						</div>
						<div className="text-sm text-gray-700 font-medium">
							{currentTime.toLocaleTimeString()}
						</div>
					</div>
				</div>
				{/* Desktop Environment */}
				<div className="flex-1 flex flex-col bg-white">
					{/* Main Desktop Area - File Icons */}
					<div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-auto">
						{/* Chrome Browser Window */}
						<AnimatePresence>
							{showBrowser && (
								<motion.div
									animate={{ opacity: 1, scale: 1, y: 0 }}
									className="absolute inset-4 bg-white rounded-lg shadow-2xl border border-gray-300 z-20"
									exit={{ opacity: 0, scale: 0.9, y: 50 }}
									initial={{ opacity: 0, scale: 0.9, y: 50 }}
								>
									{/* Browser Header */}
									<div className="bg-gray-100 rounded-t-lg p-3 border-b border-gray-300">
										<div className="flex items-center gap-2 mb-2">
											<div className="flex gap-2">
												<div className="w-3 h-3 bg-red-500 rounded-full" />
												<div className="w-3 h-3 bg-yellow-500 rounded-full" />
												<div className="w-3 h-3 bg-green-500 rounded-full" />
											</div>
											<button
												className="ml-auto text-gray-500 hover:text-gray-700"
												onClick={() => setShowBrowser(false)}
											>
                      ×
											</button>
										</div>
										<div className="flex items-center gap-2">
											<Chrome className="w-4 h-4 text-blue-600" />
											<div className="flex-1 bg-white rounded-full px-3 py-1 text-sm border border-gray-300">
												{browserUrl}
											</div>
										</div>
									</div>
									{/* Browser Content */}
									<div className="p-6 h-full overflow-auto">
										<div className="max-w-2xl mx-auto">
											{/* Google Logo */}
											<div className="text-center mb-8">
												<div className="text-6xl font-light text-gray-700 mb-4">Google</div>
											</div>
											{/* Search Box */}
											<div className="relative mb-8">
												<div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm">
													<Search className="w-5 h-5 text-gray-400 mr-3" />
													<div className="flex-1 text-gray-700">{searchQuery}</div>
												</div>
											</div>
											{/* Search Results */}
											<div className="space-y-4">
												<div className="text-sm text-gray-600 mb-4">
                        About 2,340,000 results (0.45 seconds)
												</div>
												<div className="space-y-6">
													<div>
														<div className="text-blue-600 text-lg hover:underline cursor-pointer">
															{searchQuery} - Best Practices and Guidelines
														</div>
														<div className="text-green-700 text-sm">https://example.com/guide</div>
														<div className="text-gray-600 text-sm mt-1">
                            Comprehensive guide covering {searchQuery.toLowerCase()} with practical examples and industry standards...
														</div>
													</div>
													<div>
														<div className="text-blue-600 text-lg hover:underline cursor-pointer">
                            Learn {searchQuery} - Tutorial and Documentation
														</div>
														<div className="text-green-700 text-sm">https://docs.example.com</div>
														<div className="text-gray-600 text-sm mt-1">
                            Official documentation and tutorials for {searchQuery.toLowerCase()}. Step-by-step instructions...
														</div>
													</div>
													<div>
														<div className="text-blue-600 text-lg hover:underline cursor-pointer">
															{searchQuery} Tools and Resources
														</div>
														<div className="text-green-700 text-sm">https://tools.example.com</div>
														<div className="text-gray-600 text-sm mt-1">
                            Essential tools and resources for working with {searchQuery.toLowerCase()}. Free and premium options...
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
						{/* Desktop Icons Grid */}
						<div className="grid grid-cols-4 gap-8 auto-rows-max pt-8 px-4" style={{ zIndex: 1 }}>
							<AnimatePresence>
								{computerState.fileSystem.map((file, index) => (
									<motion.div
										animate={{ opacity: 1, scale: 1, y: 0 }}
										className={cn(
											"flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-70 transition-all duration-200",
											file.isNew && "bg-green-100 shadow-lg ring-2 ring-green-300",
											file.isModified && "bg-blue-100 shadow-lg ring-2 ring-blue-300",
										)}
										exit={{ opacity: 0, scale: 0.8, y: -20 }}
										initial={file.isNew ? { opacity: 0, scale: 0.8, y: 20 } : false}
										key={`${file.path}-${index}`}
										transition={{ duration: 0.4, ease: "easeOut" }}
									>
										<div className="relative mb-3">
											{file.type === "directory" ? (
												<motion.div
													className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg"
													whileHover={{ scale: 1.1 }}
												>
													<Folder className="w-10 h-10 text-yellow-800" />
												</motion.div>
											) : (
												<motion.div
													className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg border border-gray-200"
													whileHover={{ scale: 1.1 }}
												>
													{getFileIcon(file.name)}
												</motion.div>
											)}
											{file.isNew && (
												<motion.div
													animate={{ scale: 1, rotate: 0 }}
													className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
													initial={{ scale: 0, rotate: -180 }}
												>
													<span className="text-white text-xs font-bold">+</span>
												</motion.div>
											)}
											{file.isModified && (
												<motion.div
													animate={{ scale: 1, rotate: 0 }}
													className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
													initial={{ scale: 0, rotate: -180 }}
												>
													<span className="text-white text-xs">✓</span>
												</motion.div>
											)}
										</div>
										<div className="w-full text-center">
											<span className="text-xs text-gray-700 font-medium block leading-tight break-words max-w-full">
												{file.name}
											</span>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
						{computerState.runningProcesses.length > 0 && (
							<div className="absolute top-6 right-6 z-10">
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 min-w-48"
									initial={{ opacity: 0, y: -20 }}
								>
									<div className="flex items-center gap-2 mb-3">
										<Play className="w-4 h-4 text-green-600" />
										<span className="text-sm font-medium text-gray-900">Running Programs</span>
									</div>
									<div className="space-y-2">
										{computerState.runningProcesses.map((process, index) => (
											<motion.div
												animate={{ opacity: 1, x: 0 }}
												className="flex items-center gap-2 text-xs text-gray-600"
												initial={{ opacity: 0, x: 20 }}
												key={`${process.pid}-${index}`}
											>
												<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
												<span className="truncate font-medium">{process.name}</span>
											</motion.div>
										))}
									</div>
								</motion.div>
							</div>
						)}
					</div>
					{/* Bottom Terminal Panel */}
					<div className="border-t border-gray-300 bg-gray-900 text-white flex-shrink-0">
						{/* Terminal Header */}
						<div 
							className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
							onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
						>
							<div className="flex items-center gap-2">
								<Terminal className="w-4 h-4 text-green-400" />
								<span className="text-sm font-medium">Terminal</span>
								<div className="text-xs text-gray-400">
									{computerState.currentDirectory}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400">
									{isTerminalExpanded ? "Collapse" : "Expand"}
								</span>
								<motion.div
									animate={{ rotate: isTerminalExpanded ? 180 : 0 }}
									transition={{ duration: 0.2 }}
								>
									<svg className="w-4 h-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</motion.div>
							</div>
						</div>
						{/* Terminal Content */}
						<motion.div
							animate={{ 
								height: isTerminalExpanded ? "auto" : 0,
								opacity: isTerminalExpanded ? 1 : 0,
							}}
							className="overflow-hidden"
							initial={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
						>
							<div 
								className="p-4 overflow-y-auto font-mono text-sm bg-gray-900 max-h-64"
								ref={terminalRef}
							>
								<AnimatePresence>
									{terminalOutput.map((line, index) => (
										<motion.div
											animate={{ opacity: 1, y: 0 }}
											className="text-green-400 mb-1 leading-relaxed whitespace-pre-wrap"
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
						</motion.div>
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
	);
};

// Animation Overlay Component
const AnimationOverlay: React.FC<{ animation: AnimationState }> = ({ animation }) => {
	const getAnimationIcon = () => {
		switch (animation.type) {
			case "file-created":
				return <FileText className="w-8 h-8 text-gray-700" />;
			case "file-edited":
				return <FileText className="w-8 h-8 text-gray-700" />;
			case "command-executed":
				return <Terminal className="w-8 h-8 text-gray-700" />;
			case "search-performed":
				return <Search className="w-8 h-8 text-gray-700" />;
			case "process-started":
				return <Play className="w-8 h-8 text-gray-700" />;
			case "error-occurred":
				return <AlertCircle className="w-8 h-8 text-white" />;
			default:
				return <Settings className="w-8 h-8 text-gray-700" />;
		}
	};

	const getAnimationColor = () => {
		switch (animation.type) {
			case "error-occurred":
				return "from-black/80 to-gray-900/80 border-gray-700";
			default:
				return "from-white/90 to-gray-100/90 border-gray-300";
		}
	};

	return (
		<motion.div
			animate={{ opacity: 1, scale: 1, y: 0 }}
			className={cn(
				"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
				"bg-gradient-to-br backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2",
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
				<div className={cn(
					"text-sm font-medium text-center max-w-48",
					animation.type === "error-occurred" ? "text-white" : "text-gray-800",
				)}
				>
					{animation.target && (
						<div className="truncate font-semibold">{animation.target}</div>
					)}
					<div className={cn(
						"text-xs capitalize mt-1",
						animation.type === "error-occurred" ? "text-gray-300" : "text-gray-600",
					)}
					>
						{animation.type.replace("-", " ")}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default WindowsDesktop;
