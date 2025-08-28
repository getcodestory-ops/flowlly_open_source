"use client";

import React from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";

interface TodoPanelProps {
	file: string;
}

const TodoPanel: React.FC<TodoPanelProps> = ({ file }) => {
	const { todoStates } = useChatStore();
	const state = todoStates[file];

	if (!state) {
		return (
			<div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
				Waiting for tasks...
			</div>
		);
	}

	const tasks = state?.tasks || [];
	const currentIndex: number = typeof state?.current_index === "number" ? state.current_index : -1;
	const completedCount = tasks.filter((t: any) => t.status === "completed").length;
	const totalCount = tasks.length;
	const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<div className="h-full w-full p-4 overflow-auto">
			<div className="mb-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold">Task Progress</h2>
				</div>
				<div className="mt-3">
					<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-indigo-500 transition-all duration-500"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
					<div className="mt-1 text-xs text-gray-600">{completedCount} of {totalCount} completed ({progressPct}%)</div>
				</div>
			</div>
			<ul className="space-y-2">
				{tasks.map((task: any, index: number) => {
					const isCompleted = task.status === "completed";
					const isCurrent = index === currentIndex || task.status === "in_progress";
					const isPending = task.status === "pending";
					return (
						<li
							className={`group flex items-start gap-3 rounded-md border p-3 transition-colors animate-in fade-in slide-in-from-right-2 ${
								isCurrent ? "border-indigo-300 bg-indigo-50" : isCompleted ? "border-gray-200 bg-white" : "border-gray-200 bg-white"
							}`}
							key={task.id || index}
						>
							<div className="mt-0.5">
								{isCompleted ? (
									<CheckCircle2 className="h-5 w-5 text-green-600" />
								) : isCurrent ? (
									<CircleDot className="h-5 w-5 text-indigo-600 animate-pulse" />
								) : (
									<Circle className="h-5 w-5 text-gray-400" />
								)}
							</div>
							<div className="flex-1">
								<div className={`text-sm ${isCompleted ? "line-through text-gray-400" : isCurrent ? "text-gray-900" : "text-gray-700"}`}>
									{task.title || `Task ${index + 1}`}
								</div>
								{task.notes && (
									<div className="text-xs text-gray-500 mt-1">{task.notes}</div>
								)}
							</div>
							<div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
								{isCompleted ? "completed" : isCurrent ? "in progress" : isPending ? "pending" : task.status}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default TodoPanel;


