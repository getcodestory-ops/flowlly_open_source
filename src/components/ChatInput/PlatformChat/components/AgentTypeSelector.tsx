import React from "react";
import { Bot, MessageCircle } from "lucide-react";
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from "@/components/ui/select";

interface AgentTypeSelectorProps {
	selectedAgentType: string;
	onAgentTypeChange: (agentType: string) => void;
	className?: string;
}

const AGENT_TYPES = [
	{
		id: "agent",
		name: "Agent",
		icon: Bot,
		description: "AI agent with tools and capabilities to perform actions",
	},
	{
		id: "chat",
		name: "Chat",
		icon: MessageCircle,
		description: "Simple conversational chat without tool access",
	},
];

export default function AgentTypeSelector({ 
	onAgentTypeChange,
	selectedAgentType, 
}: AgentTypeSelectorProps): JSX.Element {
	const currentType = AGENT_TYPES.find((type) => type.id === selectedAgentType);
	const Icon = currentType?.icon || Bot;

	return (
		<div>
			<Select onValueChange={onAgentTypeChange} value={selectedAgentType}>
				<SelectTrigger className="h-8 w-24 border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 shadow-sm rounded-md">
					<SelectValue>
						<div className="flex items-center gap-1.5">
							<Icon className="h-3.5 w-3.5" />
							<span className="font-medium">{currentType?.name || "Select Type"}</span>
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent className="w-72">
					{AGENT_TYPES.map((type) => {
						const TypeIcon = type.icon;
						return (
							<SelectItem 
								className="p-3 cursor-pointer hover:bg-slate-50"
								key={type.id} 
								value={type.id}
							>
								<div className="w-full space-y-1.5">
									{/* Header with icon and name */}
									<div className="flex items-center gap-2">
										<TypeIcon className="h-4 w-4 text-indigo-500" />
										<span className="font-medium text-sm">{type.name}</span>
									</div>
									{/* Description */}
									<p className="text-xs text-gray-600 leading-relaxed">
										{type.description}
									</p>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}

