import React from "react";
import {  
	Zap, 
	Sparkles,
	Brain,
	Gauge,
	ChevronDown,
	Archive
} from "lucide-react";
import { 
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { MODELS, ModelType } from "../PlatformChatInterface/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
	selectedModel: string;
	onModelChange: (model: string) => void;
	className?: string;
	selectedAgentType?: string;
}

// Main models per mode
const AGENT_MODEL_IDS = [
	"claude-opus-4.6",
	"gemini-3-pro-preview",
	"gpt-5.2",
	"z-ai/glm-5",
	"moonshotai/kimi-k2.5",
];

const CHAT_MODEL_IDS = [
	"gemini-3-flash-preview",
	"gpt-5-nano",
	"claude-haiku-4.5",
	"moonshotai/kimi-k2.5",
];

// Helper to get the main model IDs based on agent type
const getMainModelIds = (agentType?: string): string[] => {
	if (agentType === "chat") return CHAT_MODEL_IDS;
	return AGENT_MODEL_IDS;
};

// Get provider key for grouping (used for dividers)
const getProviderKey = (modelId: string): string => {
	if (modelId.includes("claude") || modelId.includes("sonnet") || modelId.includes("opus") || modelId.includes("haiku")) return "claude";
	if (modelId.includes("gpt") || modelId.includes("openai")) return "openai";
	if (modelId.includes("gemini")) return "gemini";
	if (modelId.includes("z-ai") || modelId.includes("glm")) return "z-ai";
	if (modelId.includes("moonshotai") || modelId.includes("kimi")) return "moonshotai";
	if (modelId.includes("xiaomi") || modelId.includes("mimo")) return "xiaomi";
	return "other";
};

// Get provider logo path based on model ID
const getProviderLogo = (modelId: string): string => {
	if (modelId.includes("gemini")) {
		return "/providerLogos/gemini-color.svg";
	}
	if (modelId.includes("claude") || modelId.includes("sonnet") || modelId.includes("opus")) {
		return "/providerLogos/anthropic.svg";
	}
	if (modelId.includes("gpt") || modelId.includes("openai")) {
		return "/providerLogos/openai.svg";
	}
	if (modelId.includes("z-ai/glm-5")) {
		return "/providerLogos/flowlly.svg";
	}
	if (modelId.includes("z-ai") || modelId.includes("glm")) {
		return "/providerLogos/zai.svg";
	}
	if (modelId.includes("moonshotai") || modelId.includes("kimi")) {
		return "/providerLogos/moonshot.svg";
	}
	if (modelId.includes("xiaomi") || modelId.includes("mimo")) {
		return "/providerLogos/xiaomimimo.svg";
	}
	// Default fallback
	return "/providerLogos/openai.svg";
};

// Provider logo component
const ProviderLogo = ({ modelId, size = "md" }: { modelId: string; size?: "sm" | "md" }): JSX.Element => {
	const logoSrc = getProviderLogo(modelId);
	const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
	
	return (
		<img 
			alt="Provider logo"
			className={`${sizeClass} object-contain`}
			src={logoSrc}
		/>
	);
};

// Capability badge component
const CapabilityBadge = ({ 
	icon: Icon, 
	bgColor, 
	iconColor,
	title 
}: { 
	icon: React.ComponentType<{ className?: string }>; 
	bgColor: string; 
	iconColor: string;
	title: string;
}): JSX.Element => (
	<div 
		className={cn("h-6 w-6 rounded-md flex items-center justify-center", bgColor)}
		title={title}
	>
		<Icon className={cn("h-3.5 w-3.5", iconColor)} />
	</div>
);

// Get capability badges based on model properties
const getModelBadges = (model: ModelType): JSX.Element[] => {
	const badges: JSX.Element[] = [];
	
	// Fast badge (speed >= 4)
	if (model.speed >= 4) {
		badges.push(
			<CapabilityBadge 
				bgColor="bg-amber-50" 
				icon={Zap} 
				iconColor="text-amber-500"
				key="fast"
				title="Fast"
			/>
		);
	}
	
	// High quality badge (performance >= 4)
	if (model.performance >= 4) {
		badges.push(
			<CapabilityBadge 
				bgColor="bg-emerald-50" 
				icon={Sparkles} 
				iconColor="text-emerald-500"
				key="quality"
				title="High Quality"
			/>
		);
	}
	
	// Reasoning badge (performance === 5)
	if (model.performance === 5) {
		badges.push(
			<CapabilityBadge 
				bgColor="bg-purple-50" 
				icon={Brain} 
				iconColor="text-purple-500"
				key="reasoning"
				title="Advanced Reasoning"
			/>
		);
	}
	
	// Large context badge
	if (model.contextSize === "large" || model.contextSize === "extra-large") {
		badges.push(
			<CapabilityBadge 
				bgColor="bg-blue-50" 
				icon={Gauge} 
				iconColor="text-blue-500"
				key="context"
				title="Large Context"
			/>
		);
	}
	
	return badges;
};

// Subtle divider between provider groups
const ProviderDivider = (): JSX.Element => (
	<div className="my-1 border-t border-slate-100" />
);

// Model row component
const ModelRow = ({ 
	model, 
	isSelected, 
	onSelect 
}: { 
	model: ModelType; 
	isSelected: boolean; 
	onSelect: () => void;
}): JSX.Element => {
	const badges = getModelBadges(model);
	
	return (
		<button
			className={cn(
				"w-full px-3 py-2.5 flex items-center justify-between rounded-lg transition-colors text-left",
				isSelected 
					? "bg-slate-100" 
					: "hover:bg-slate-50"
			)}
			onClick={onSelect}
		>
			{/* Left: Logo + Model name */}
			<div className="flex items-center gap-2.5">
				<ProviderLogo modelId={model.id} />
				<span className={cn(
					"text-sm",
					isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-700"
				)}>
					{model.name}
				</span>
			</div>
			
			{/* Right: Capability badges */}
			<div className="flex items-center gap-1.5">
				{badges}
			</div>
		</button>
	);
};

export default function ModelSelector({ 
	className = "",
	onModelChange,
	selectedModel,
	selectedAgentType,
}: ModelSelectorProps): JSX.Element {
	const [open, setOpen] = React.useState(false);
	const [showArchived, setShowArchived] = React.useState(false);
	
	// Show all models
	const filteredModels = MODELS;
	
	// Split into main and archived models based on agent type
	const mainModelIds = getMainModelIds(selectedAgentType);
	const mainModels = filteredModels.filter((model) => mainModelIds.includes(model.id));
	const archivedModels = filteredModels.filter((model) => !mainModelIds.includes(model.id));
	
	const currentModel = filteredModels.find((model) => model.id === selectedModel);

	const handleSelect = (modelId: string) => {
		onModelChange(modelId);
		setOpen(false);
	};

	return (
		<div className={className}>
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<button className="h-8 px-3 flex items-center gap-2 border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 shadow-sm rounded-md transition-colors">
						{currentModel && <ProviderLogo modelId={currentModel.id} />}
						<span className="font-medium">{currentModel?.name || "Select Model"}</span>
						<ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
					</button>
				</PopoverTrigger>
				<PopoverContent 
					align="start"
					className="w-[420px] p-2"
					sideOffset={4}
				>
					{/* Scrollable model list */}
					<div className="max-h-[60vh] overflow-y-auto pr-1">
						{/* Main Models */}
						<div className="space-y-1">
							{mainModels.map((model: ModelType) => (
								<ModelRow
									isSelected={model.id === selectedModel}
									key={model.id}
									model={model}
									onSelect={() => handleSelect(model.id)}
								/>
							))}
						</div>
						
						{/* Archived Models Section */}
						{archivedModels.length > 0 && (
							<div className="mt-2 pt-2 border-t border-slate-100">
								<button
									className="w-full px-3 py-2 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
									onClick={() => setShowArchived(!showArchived)}
								>
									<Archive className="h-3.5 w-3.5" />
									<span>Other models</span>
									<ChevronDown className={cn(
										"h-3 w-3 ml-auto transition-transform",
										showArchived && "rotate-180"
									)} />
								</button>
								
								{showArchived && (
									<div className="mt-1 space-y-1">
										{archivedModels.map((model: ModelType, index: number) => (
											<React.Fragment key={model.id}>
												{index > 0 && getProviderKey(model.id) !== getProviderKey(archivedModels[index - 1].id) && (
													<ProviderDivider />
												)}
												<ModelRow
													isSelected={model.id === selectedModel}
													model={model}
													onSelect={() => handleSelect(model.id)}
												/>
											</React.Fragment>
										))}
									</div>
								)}
							</div>
						)}
					</div>
					
					{/* Legend - pinned outside scroll area */}
					<div className="mt-3 pt-3 border-t border-slate-100">
						<div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-amber-50 flex items-center justify-center">
									<Zap className="h-2.5 w-2.5 text-amber-500" />
								</div>
								<span>Fast</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-emerald-50 flex items-center justify-center">
									<Sparkles className="h-2.5 w-2.5 text-emerald-500" />
								</div>
								<span>Quality</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-purple-50 flex items-center justify-center">
									<Brain className="h-2.5 w-2.5 text-purple-500" />
								</div>
								<span>Reasoning</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-blue-50 flex items-center justify-center">
									<Gauge className="h-2.5 w-2.5 text-blue-500" />
								</div>
								<span>Large Context</span>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
