import React from "react";
import {  
	Zap, 
	Sparkles,
	Brain,
	Gauge,
	ChevronDown,
	Archive,
	Layers,
	Flame,
} from "lucide-react";
import { 
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { MODELS, ModelType, getTierModel } from "../PlatformChatInterface/types";
import type { AutoTier } from "../PlatformChatInterface/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
	selectedModel: string;
	onModelChange: (model: string) => void;
	className?: string;
	selectedAgentType?: string;
	autoTier?: AutoTier | null;
	onTierChange?: (tier: AutoTier | null) => void;
}

// ── Tier display configuration ─────────────────────────────────────
const TIER_CONFIG: Record<
	AutoTier,
	{
		label: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
		triggerBg: string;
		triggerBorder: string;
		triggerText: string;
		triggerIconColor: string;
		activeBg: string;
		activeRing: string;
		modelLabelColor: string;
	}
> = {
	fast: {
		label: "Fast",
		description: "Quick answers, simple tasks",
		icon: Zap,
		triggerBg: "bg-gradient-to-r from-amber-50 to-orange-50",
		triggerBorder: "border-amber-200",
		triggerText: "text-amber-700",
		triggerIconColor: "text-amber-500",
		activeBg: "bg-gradient-to-r from-amber-50 to-orange-50",
		activeRing: "ring-amber-200",
		modelLabelColor: "text-amber-600",
	},
	balanced: {
		label: "Balanced",
		description: "Everyday tasks, good quality",
		icon: Layers,
		triggerBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
		triggerBorder: "border-blue-200",
		triggerText: "text-blue-700",
		triggerIconColor: "text-blue-500",
		activeBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
		activeRing: "ring-blue-200",
		modelLabelColor: "text-blue-600",
	},
	complex: {
		label: "Complex",
		description: "Deep reasoning, multi-step",
		icon: Brain,
		triggerBg: "bg-gradient-to-r from-purple-50 to-indigo-50",
		triggerBorder: "border-purple-200",
		triggerText: "text-purple-700",
		triggerIconColor: "text-purple-500",
		activeBg: "bg-gradient-to-r from-purple-50 to-indigo-50",
		activeRing: "ring-purple-200",
		modelLabelColor: "text-purple-600",
	},
	max: {
		label: "Max",
		description: "Maximum power, no limits",
		icon: Flame,
		triggerBg: "bg-gradient-to-r from-rose-50 to-orange-50",
		triggerBorder: "border-rose-200",
		triggerText: "text-rose-700",
		triggerIconColor: "text-rose-500",
		activeBg: "bg-gradient-to-r from-rose-50 to-orange-50",
		activeRing: "ring-rose-200",
		modelLabelColor: "text-rose-600",
	},
};

const TIER_ORDER: AutoTier[] = ["fast", "balanced", "complex", "max"];

// ── Existing model helpers ─────────────────────────────────────────
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

const getMainModelIds = (agentType?: string): string[] => {
	if (agentType === "chat") return CHAT_MODEL_IDS;
	return AGENT_MODEL_IDS;
};

const getProviderKey = (modelId: string): string => {
	if (modelId.includes("claude") || modelId.includes("sonnet") || modelId.includes("opus") || modelId.includes("haiku")) return "claude";
	if (modelId.includes("gpt") || modelId.includes("openai")) return "openai";
	if (modelId.includes("gemini")) return "gemini";
	if (modelId.includes("z-ai") || modelId.includes("glm")) return "z-ai";
	if (modelId.includes("moonshotai") || modelId.includes("kimi")) return "moonshotai";
	if (modelId.includes("xiaomi") || modelId.includes("mimo")) return "xiaomi";
	return "other";
};

const getProviderLogo = (modelId: string): string => {
	if (modelId.includes("gemini")) return "/providerLogos/gemini-color.svg";
	if (modelId.includes("claude") || modelId.includes("sonnet") || modelId.includes("opus")) return "/providerLogos/anthropic.svg";
	if (modelId.includes("gpt") || modelId.includes("openai")) return "/providerLogos/openai.svg";
	if (modelId.includes("z-ai/glm-5")) return "/providerLogos/flowlly.svg";
	if (modelId.includes("z-ai") || modelId.includes("glm")) return "/providerLogos/zai.svg";
	if (modelId.includes("moonshotai") || modelId.includes("kimi")) return "/providerLogos/moonshot.svg";
	if (modelId.includes("xiaomi") || modelId.includes("mimo")) return "/providerLogos/xiaomimimo.svg";
	return "/providerLogos/openai.svg";
};

// ── Small reusable components ──────────────────────────────────────
const ProviderLogo = ({ modelId, size = "md" }: { modelId: string; size?: "sm" | "md" }): JSX.Element => {
	const logoSrc = getProviderLogo(modelId);
	const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
	return <img alt="Provider logo" className={`${sizeClass} object-contain`} src={logoSrc} />;
};

const CapabilityBadge = ({ icon: Icon, bgColor, iconColor, title }: { 
	icon: React.ComponentType<{ className?: string }>; bgColor: string; iconColor: string; title: string;
}): JSX.Element => (
	<div className={cn("h-6 w-6 rounded-md flex items-center justify-center", bgColor)} title={title}>
		<Icon className={cn("h-3.5 w-3.5", iconColor)} />
	</div>
);

const getModelBadges = (model: ModelType): JSX.Element[] => {
	const badges: JSX.Element[] = [];
	if (model.speed >= 4) badges.push(<CapabilityBadge bgColor="bg-amber-50" icon={Zap} iconColor="text-amber-500" key="fast" title="Fast" />);
	if (model.performance >= 4) badges.push(<CapabilityBadge bgColor="bg-emerald-50" icon={Sparkles} iconColor="text-emerald-500" key="quality" title="High Quality" />);
	if (model.performance === 5) badges.push(<CapabilityBadge bgColor="bg-purple-50" icon={Brain} iconColor="text-purple-500" key="reasoning" title="Advanced Reasoning" />);
	if (model.contextSize === "large" || model.contextSize === "extra-large") badges.push(<CapabilityBadge bgColor="bg-blue-50" icon={Gauge} iconColor="text-blue-500" key="context" title="Large Context" />);
	return badges;
};

const ProviderDivider = (): JSX.Element => <div className="my-1 border-t border-slate-100" />;

// ── Model row ──────────────────────────────────────────────────────
const ModelRow = ({ model, isSelected, onSelect }: { model: ModelType; isSelected: boolean; onSelect: () => void }): JSX.Element => {
	const badges = getModelBadges(model);
	return (
		<button
			className={cn(
				"w-full px-3 py-2.5 flex items-center justify-between rounded-lg transition-colors text-left",
				isSelected ? "bg-slate-100" : "hover:bg-slate-50"
			)}
			onClick={onSelect}
		>
			<div className="flex items-center gap-2.5">
				<ProviderLogo modelId={model.id} />
				<span className={cn("text-sm", isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
					{model.name}
				</span>
			</div>
			<div className="flex items-center gap-1.5">{badges}</div>
		</button>
	);
};

// ── Tier pill (compact) ────────────────────────────────────────────
const TierPill = ({
	tier,
	isSelected,
	onSelect,
}: {
	tier: AutoTier;
	isSelected: boolean;
	onSelect: () => void;
}): JSX.Element => {
	const cfg = TIER_CONFIG[tier];
	const Icon = cfg.icon;

	return (
		<button
			className={cn(
				"flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all",
				isSelected
					? cn(cfg.activeBg, "ring-1", cfg.activeRing, cfg.triggerText, "shadow-sm")
					: "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
			)}
			onClick={onSelect}
		>
			<Icon className={cn("h-3 w-3", isSelected ? cfg.triggerIconColor : "text-slate-400")} />
			<span>{cfg.label}</span>
		</button>
	);
};

// ── Main component ─────────────────────────────────────────────────
export default function ModelSelector({ 
	className = "",
	onModelChange,
	selectedModel,
	selectedAgentType,
	autoTier = null,
	onTierChange,
}: ModelSelectorProps): JSX.Element {
	const [open, setOpen] = React.useState(false);
	const [showArchived, setShowArchived] = React.useState(false);

	const filteredModels = MODELS;
	const agentType = (selectedAgentType as "agent" | "chat") || "agent";

	const mainModelIds = getMainModelIds(selectedAgentType);
	const mainModels = filteredModels.filter((m) => mainModelIds.includes(m.id));
	const archivedModels = filteredModels.filter((m) => !mainModelIds.includes(m.id));

	const currentModel = filteredModels.find((m) => m.id === selectedModel);

	// Resolve tier model names for display
	const tierModelNames = React.useMemo(() => {
		const names: Record<AutoTier, string> = { fast: "", balanced: "", complex: "", max: "" };
		for (const t of TIER_ORDER) {
			const id = getTierModel(t, agentType);
			names[t] = filteredModels.find((m) => m.id === id)?.name || id;
		}
		return names;
	}, [agentType, filteredModels]);

	const handleModelSelect = (modelId: string) => {
		onModelChange(modelId);
		setOpen(false);
	};

	const handleTierSelect = (tier: AutoTier) => {
		onTierChange?.(tier);
		setOpen(false);
	};

	// Determine trigger display
	const activeTierCfg = autoTier ? TIER_CONFIG[autoTier] : null;
	const ActiveIcon = activeTierCfg?.icon;

	return (
		<div className={className}>
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					{activeTierCfg && ActiveIcon ? (
						<button className={cn(
							"h-8 px-3 flex items-center gap-2 border text-xs shadow-sm rounded-md transition-colors",
							activeTierCfg.triggerBg,
							activeTierCfg.triggerBorder,
							activeTierCfg.triggerText,
						)}>
							<ActiveIcon className={cn("h-3.5 w-3.5", activeTierCfg.triggerIconColor)} />
							<span className="font-semibold">{activeTierCfg.label}</span>
							<ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open && "rotate-180")} />
						</button>
					) : (
						<button className="h-8 px-3 flex items-center gap-2 border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 shadow-sm rounded-md transition-colors">
							{currentModel && <ProviderLogo modelId={currentModel.id} />}
							<span className="font-medium">{currentModel?.name || "Select Model"}</span>
							<ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
						</button>
					)}
				</PopoverTrigger>

				<PopoverContent align="start" className="w-[420px] p-2" sideOffset={4}>
					{/* ── Tier pills ───────────────────────────── */}
					{onTierChange && (
						<>
							<div className="flex gap-1 p-1 bg-slate-50 rounded-lg mb-1">
								{TIER_ORDER.map((t) => (
									<TierPill
										isSelected={autoTier === t}
										key={t}
										onSelect={() => handleTierSelect(t)}
										tier={t}
									/>
								))}
							</div>
							{autoTier && (
								<div className="px-2 pb-1">
									<span className="text-[10px] text-slate-400">
										Using <span className={cn("font-medium", TIER_CONFIG[autoTier].modelLabelColor)}>{tierModelNames[autoTier]}</span>
									</span>
								</div>
							)}
							<div className="border-t border-slate-100 my-1" />
						</>
					)}

					{/* ── Scrollable model list ─────────────────── */}
					<div className="max-h-[50vh] overflow-y-auto pr-1">
						<div className="space-y-1">
							{mainModels.map((model: ModelType) => (
								<ModelRow
									isSelected={!autoTier && model.id === selectedModel}
									key={model.id}
									model={model}
									onSelect={() => handleModelSelect(model.id)}
								/>
							))}
						</div>

						{archivedModels.length > 0 && (
							<div className="mt-2 pt-2 border-t border-slate-100">
								<button
									className="w-full px-3 py-2 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
									onClick={() => setShowArchived(!showArchived)}
								>
									<Archive className="h-3.5 w-3.5" />
									<span>Other models</span>
									<ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", showArchived && "rotate-180")} />
								</button>
								{showArchived && (
									<div className="mt-1 space-y-1">
										{archivedModels.map((model: ModelType, index: number) => (
											<React.Fragment key={model.id}>
												{index > 0 && getProviderKey(model.id) !== getProviderKey(archivedModels[index - 1].id) && <ProviderDivider />}
												<ModelRow
													isSelected={!autoTier && model.id === selectedModel}
													model={model}
													onSelect={() => handleModelSelect(model.id)}
												/>
											</React.Fragment>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{/* ── Legend ──────────────────────────────────── */}
					<div className="mt-3 pt-3 border-t border-slate-100">
						<div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-amber-50 flex items-center justify-center"><Zap className="h-2.5 w-2.5 text-amber-500" /></div>
								<span>Fast</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-emerald-50 flex items-center justify-center"><Sparkles className="h-2.5 w-2.5 text-emerald-500" /></div>
								<span>Quality</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-purple-50 flex items-center justify-center"><Brain className="h-2.5 w-2.5 text-purple-500" /></div>
								<span>Reasoning</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-4 w-4 rounded bg-blue-50 flex items-center justify-center"><Gauge className="h-2.5 w-2.5 text-blue-500" /></div>
								<span>Large Context</span>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
