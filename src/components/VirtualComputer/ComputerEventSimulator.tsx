"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
	Play, 
	Square, 
	FileText, 
	Terminal, 
	Search, 
	Globe, 
	Database, 
	AlertCircle,
	Code,
	FolderPlus,
	Edit,
	Trash2,
	Download,
	Upload,
	Wifi,
	Settings,
	ChevronDown,
	ChevronRight
} from "lucide-react";
import { ComputerEvent } from "@/types/computerEvents";
import { cn } from "@/lib/utils";

interface ComputerEventSimulatorProps {
  onEventGenerated: (event: ComputerEvent) => void;
  sandbox_id: string;
  className?: string;
}

interface EventCategory {
  name: string;
  icon: React.ReactNode;
  events: EventTemplate[];
  color: string;
}

interface EventTemplate {
  name: string;
  description: string;
  icon: React.ReactNode;
  generateEvent: (sandbox_id: string) => ComputerEvent;
}

const ComputerEventSimulator: React.FC<ComputerEventSimulatorProps> = ({
	onEventGenerated,
	sandbox_id,
	className,
}) => {
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["files"]));
	const [recentEvents, setRecentEvents] = useState<string[]>([]);

	const toggleCategory = (categoryName: string) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categoryName)) {
			newExpanded.delete(categoryName);
		} else {
			newExpanded.add(categoryName);
		}
		setExpandedCategories(newExpanded);
	};

	const handleEventGeneration = (template: EventTemplate) => {
		const event = template.generateEvent(sandbox_id);
		onEventGenerated(event);
    
		// Track recent events
		setRecentEvents((prev) => [template.name, ...prev.slice(0, 4)]);
	};

	const eventCategories: EventCategory[] = [
		{
			name: "sandbox",
			icon: <Settings className="w-4 h-4" />,
			color: "text-purple-600",
			events: [
				{
					name: "Start Sandbox",
					description: "Initialize a new sandbox environment",
					icon: <Play className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "sandbox_started",
						timestamp: Date.now(),
						sandbox_id,
						environment: "Ubuntu 22.04",
						resources: {
							cpu: "2 vCPU",
							memory: "4GB RAM",
							storage: "20GB SSD",
						},
					}),
				},
				{
					name: "Stop Sandbox",
					description: "Shutdown the sandbox environment",
					icon: <Square className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "sandbox_stopped",
						timestamp: Date.now(),
						sandbox_id,
						reason: "User requested shutdown",
						duration: Math.floor(Math.random() * 3600000), // Random duration up to 1 hour
					}),
				},
			],
		},
		{
			name: "files",
			icon: <FileText className="w-4 h-4" />,
			color: "text-blue-600",
			events: [
				{
					name: "Create Python File",
					description: "Create a new Python script",
					icon: <Code className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "file_created",
						timestamp: Date.now(),
						sandbox_id,
						file_name: `script_${Date.now()}.py`,
						file_path: `/workspace/script_${Date.now()}.py`,
						file_type: "python",
						file_size: Math.floor(Math.random() * 5000) + 500,
					}),
				},
				{
					name: "Create Config File",
					description: "Create a configuration file",
					icon: <Settings className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "file_created",
						timestamp: Date.now(),
						sandbox_id,
						file_name: "config.json",
						file_path: "/workspace/config.json",
						file_type: "json",
						file_size: 256,
					}),
				},
				{
					name: "Edit Main File",
					description: "Modify the main.py file",
					icon: <Edit className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "file_edited",
						timestamp: Date.now(),
						sandbox_id,
						file_name: "main.py",
						file_path: "/workspace/main.py",
						old_content: "print('Hello')",
						new_content: "print('Hello, World!')",
						changes_summary: "Updated greeting message",
					}),
				},
				{
					name: "Create Directory",
					description: "Create a new folder",
					icon: <FolderPlus className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "file_created",
						timestamp: Date.now(),
						sandbox_id,
						file_name: `New Folder ${Date.now()}`,
						file_path: `/workspace/New Folder ${Date.now()}`,
						file_type: "directory",
					}),
				},
				{
					name: "Write to File",
					description: "Write content to a file",
					icon: <FileText className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "file_writing",
						timestamp: Date.now(),
						sandbox_id,
						file_name: "output.txt",
						file_path: "/workspace/output.txt",
						content: "Processing data...\nResults: Success\nTimestamp: " + new Date().toISOString(),
						append: false,
					}),
				},
			],
		},
		{
			name: "commands",
			icon: <Terminal className="w-4 h-4" />,
			color: "text-green-600",
			events: [
				{
					name: "Run Python Script",
					description: "Execute a Python file",
					icon: <Play className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "command_executed",
						timestamp: Date.now(),
						sandbox_id,
						command: "python3 main.py",
						working_directory: "/workspace",
						exit_code: 0,
						output: "Hello, World!\nScript executed successfully!",
					}),
				},
				{
					name: "Install Package",
					description: "Install a Python package",
					icon: <Download className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "command_executed",
						timestamp: Date.now(),
						sandbox_id,
						command: "pip install requests",
						working_directory: "/workspace",
						exit_code: 0,
						output: "Collecting requests\nInstalling collected packages: requests\nSuccessfully installed requests-2.31.0",
					}),
				},
				{
					name: "List Files",
					description: "List directory contents",
					icon: <FileText className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "command_executed",
						timestamp: Date.now(),
						sandbox_id,
						command: "ls -la",
						working_directory: "/workspace",
						exit_code: 0,
						output: "total 12\ndrwxr-xr-x 2 user user 4096 Dec 10 10:30 .\ndrwxr-xr-x 3 user user 4096 Dec 10 10:29 ..\n-rw-r--r-- 1 user user   29 Dec 10 10:30 main.py\n-rw-r--r-- 1 user user   15 Dec 10 10:30 requirements.txt",
					}),
				},
				{
					name: "Start Web Server",
					description: "Start a development server",
					icon: <Globe className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "process_started",
						timestamp: Date.now(),
						sandbox_id,
						process_name: "http.server",
						pid: Math.floor(Math.random() * 10000) + 1000,
						command: "python3 -m http.server 8000",
					}),
				},
			],
		},
		{
			name: "search",
			icon: <Search className="w-4 h-4" />,
			color: "text-yellow-600",
			events: [
				{
					name: "Google Search",
					description: "Search the web for information",
					icon: <Globe className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "google_search",
						timestamp: Date.now(),
						sandbox_id,
						query: "Python async programming best practices",
						results_count: 15,
						top_result: "Real Python - Async IO in Python",
					}),
				},
				{
					name: "Search Documentation",
					description: "Search project documentation",
					icon: <Database className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "project_docs_search",
						timestamp: Date.now(),
						sandbox_id,
						query: "API authentication methods",
						documents_found: 5,
						relevant_docs: ["auth.md", "api-guide.md", "security.md"],
					}),
				},
			],
		},
		{
			name: "network",
			icon: <Wifi className="w-4 h-4" />,
			color: "text-indigo-600",
			events: [
				{
					name: "API Request",
					description: "Make an HTTP request",
					icon: <Upload className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "network_request",
						timestamp: Date.now(),
						sandbox_id,
						url: "https://api.example.com/data",
						method: "GET",
						status_code: 200,
						response_time: Math.floor(Math.random() * 500) + 100,
					}),
				},
			],
		},
		{
			name: "errors",
			icon: <AlertCircle className="w-4 h-4" />,
			color: "text-red-600",
			events: [
				{
					name: "Python Error",
					description: "Simulate a Python runtime error",
					icon: <AlertCircle className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "error",
						timestamp: Date.now(),
						sandbox_id,
						error_type: "NameError",
						error_message: "name 'undefined_variable' is not defined",
						stack_trace: "Traceback (most recent call last):\n  File \"main.py\", line 5, in <module>\n    print(undefined_variable)\nNameError: name 'undefined_variable' is not defined",
						file_path: "/workspace/main.py",
					}),
				},
				{
					name: "File Not Found",
					description: "Simulate a file not found error",
					icon: <FileText className="w-4 h-4" />,
					generateEvent: (sandbox_id) => ({
						action: "error",
						timestamp: Date.now(),
						sandbox_id,
						error_type: "FileNotFoundError",
						error_message: "No such file or directory: 'missing_file.txt'",
						file_path: "/workspace/missing_file.txt",
					}),
				},
			],
		},
	];

	return (
		<div className={cn("bg-white border-t border-gray-200 p-3", className)}>
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-xs font-semibold text-gray-900">Event Simulator</h3>
				<div className="text-xs text-gray-500">
					{sandbox_id.startsWith("fake_") ? "Demo Mode" : `Sandbox: ${sandbox_id.slice(0, 8)}...`}
				</div>
			</div>
			{/* Recent Events */}
			{recentEvents.length > 0 && (
				<div className="mb-3 p-2 bg-gray-50 rounded-lg">
					<div className="text-xs font-medium text-gray-700 mb-1">Recent Events:</div>
					<div className="flex flex-wrap gap-1">
						{recentEvents.map((event, index) => (
							<span
								className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
								key={index}
							>
								{event}
							</span>
						))}
					</div>
				</div>
			)}
			{/* Event Categories */}
			<div className="space-y-1 max-h-48 overflow-y-auto">
				{eventCategories.map((category) => (
					<div className="border border-gray-200 rounded-lg" key={category.name}>
						<button
							className="w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
							onClick={() => toggleCategory(category.name)}
						>
							<div className="flex items-center gap-2">
								<div className={category.color}>
									{category.icon}
								</div>
								<span className="text-sm font-medium text-gray-900 capitalize">
									{category.name}
								</span>
								<span className="text-xs text-gray-500">
                  ({category.events.length})
								</span>
							</div>
							{expandedCategories.has(category.name) ? (
								<ChevronDown className="w-4 h-4 text-gray-400" />
							) : (
								<ChevronRight className="w-4 h-4 text-gray-400" />
							)}
						</button>
						{expandedCategories.has(category.name) && (
							<div className="border-t border-gray-200 p-1 space-y-0.5">
								{category.events.map((event, index) => (
									<Button
										className="w-full justify-start h-auto p-1.5 text-left"
										key={index}
										onClick={() => handleEventGeneration(event)}
										size="sm"
										variant="ghost"
									>
										<div className="flex items-start gap-2 w-full">
											<div className={cn("mt-0.5", category.color)}>
												{event.icon}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-xs font-medium text-gray-900">
													{event.name}
												</div>
												<div className="text-xs text-gray-500 mt-0.5">
													{event.description}
												</div>
											</div>
										</div>
									</Button>
								))}
							</div>
						)}
					</div>
				))}
			</div>
			{/* Quick Actions */}
			<div className="mt-3 pt-3 border-t border-gray-200">
				<div className="text-xs font-medium text-gray-700 mb-2">Quick Actions:</div>
				<div className="flex flex-wrap gap-1">
					<Button
						className="text-xs h-7 px-2"
						onClick={() => handleEventGeneration(eventCategories[1].events[0])} // Create Python File
						size="sm"
						variant="outline"
					>
						<Code className="w-3 h-3 mr-1" />
            New File
					</Button>
					<Button
						className="text-xs h-7 px-2"
						onClick={() => handleEventGeneration(eventCategories[2].events[0])} // Run Python
						size="sm"
						variant="outline"
					>
						<Play className="w-3 h-3 mr-1" />
            Run Code
					</Button>
					<Button
						className="text-xs h-7 px-2"
						onClick={() => handleEventGeneration(eventCategories[3].events[0])} // Google Search
						size="sm"
						variant="outline"
					>
						<Search className="w-3 h-3 mr-1" />
            Search
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ComputerEventSimulator;
