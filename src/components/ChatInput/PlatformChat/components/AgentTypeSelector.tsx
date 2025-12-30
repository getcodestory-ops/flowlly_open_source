import React from "react";
import { Bot, MessageCircle, Zap, Clock, FileText, Database } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AgentTypeSelectorProps {
	selectedAgentType: "agent" | "chat";
	onAgentTypeChange: (agentType: "agent" | "chat") => void;
	className?: string;
}

const AGENT_TYPES = [
	{
		id: "chat",
		name: "Chat",
		icon: MessageCircle,
		shortDesc: "Quick answers",
		description: "Simple OpenAI-style chat for quick answers",
		features: [
			{ icon: Zap, text: "Fast responses" },
			{ icon: MessageCircle, text: "Simple Q&A" },
		],
		gradient: "from-indigo-500 to-purple-500",
		bgColor: "bg-blue-50",
		textColor: "text-blue-700",
		borderColor: "border-blue-500",
		hoverBg: "hover:bg-blue-100",
	},
	{
		id: "agent",
		name: "Agent",
		icon: Bot,
		shortDesc: "Advanced capabilities",
		description: "Agents can run for longer, create files, and fetch data from integrations",
		features: [
			{ icon: Clock, text: "Long-running tasks" },
			{ icon: FileText, text: "Create & edit files" },
			{ icon: Database, text: "Procore & Microsoft data access" },
		],
		gradient: "from-indigo-500 to-purple-500",
		bgColor: "bg-purple-50",
		textColor: "text-purple-700",
		borderColor: "border-purple-500",
		hoverBg: "hover:bg-purple-100",
	},
];

export default function AgentTypeSelector({ 
	onAgentTypeChange,
	selectedAgentType, 
}: AgentTypeSelectorProps): JSX.Element {
	return (
		<TooltipProvider delayDuration={200}>
			<div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 shadow-sm">
				{AGENT_TYPES.map((type) => {
					const TypeIcon = type.icon;
					const isSelected = type.id === selectedAgentType;
					
					return (
						<Tooltip key={type.id}>
							<TooltipTrigger asChild>
								<button
									className={cn(
										"relative flex items-center gap-2 px-3 rounded-md transition-all duration-200 text-xs font-medium",
										isSelected
											? `${type.bgColor} ${type.textColor} shadow-sm`
											: "text-slate-600 hover:text-slate-900 hover:bg-white",
									)}
									onClick={() => onAgentTypeChange(type.id as "agent" | "chat")}
								>
									<div
										className={cn(
											"flex items-center justify-center rounded-md transition-all",
											isSelected
												? `bg-gradient-to-r ${type.gradient} p-1`
												: "",
										)}
									>
										<TypeIcon
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												isSelected ? "text-white" : "",
											)}
										/>
									</div>
									<span>{type.name}</span>
									{isSelected && (
										<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r ${type.gradient}" />
									)}
								</button>
							</TooltipTrigger>
							<TooltipContent
								className="w-72 p-0  bg-white border border-slate-200 shadow-lg"
								side="bottom"
								sideOffset={8}
							>
								<div className="p-4 space-y-3">
									<div className="flex items-start gap-3">
										<div
											className={cn(
												"flex items-center justify-center rounded-lg p-2 bg-gradient-to-r",
												type.gradient,
											)}
										>
											<TypeIcon className="h-5 w-5 text-white" />
										</div>
										<div className="flex-1">
											<h4 className="text-sm font-semibold text-slate-900">
												{type.name}
											</h4>
											<p className="text-xs text-slate-600 mt-0.5">
												{type.shortDesc}
											</p>
										</div>
									</div>
									<p className="text-xs text-slate-700 leading-relaxed">
										{type.description}
									</p>
									<div className="space-y-2 pt-2 border-t border-slate-100">
										<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
											Capabilities
										</p>
										<ul className="space-y-1.5">
											{type.features.map((feature, idx) => {
												const FeatureIcon = feature.icon;
												return (
													<li
														className="flex items-center gap-2 text-xs text-slate-700"
														key={idx}
													>
														<FeatureIcon className="h-3.5 w-3.5 text-slate-400" />
														<span>{feature.text}</span>
													</li>
												);
											})}
										</ul>
									</div>
								</div>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</TooltipProvider>
	);
}

