import React from "react";
import {  
	Zap, 
	Target, 
	Star
} from "lucide-react";
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from "@/components/ui/select";
import { MODELS, ModelType } from "../PlatformChatInterface/types";

interface ModelSelectorProps {
	selectedModel: string;
	onModelChange: (model: string) => void;
	className?: string;
	selectedAgentType?: string;
}

// Helper component for rating stars
const RatingStars = ({ rating, maxRating = 5 }: { rating: number; maxRating?: number }): JSX.Element => {
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: maxRating }, (_, i) => (
				<Star
					className={`h-2.5 w-2.5 ${
						i < rating 
							? "fill-yellow-400 text-yellow-400" 
							: "fill-gray-200 text-gray-200"
					}`}
					key={i}
				/>
			))}
		</div>
	);
};

export default function ModelSelector({ 
	className = "",
	onModelChange,
	selectedModel,
	selectedAgentType = "agent",
}: ModelSelectorProps): JSX.Element {
	// Filter models based on agent type
	const filteredModels = selectedAgentType === "chat" 
		? MODELS // Show all models in chat mode
		: MODELS.filter((model) => model.id !== "gpt-5"); // All models except OpenAI GPT-5 in agent mode
	
	const currentModel = filteredModels.find((model) => model.id === selectedModel);

	return (
		<div>
			<Select onValueChange={onModelChange} value={selectedModel}>
				<SelectTrigger className="h-8 w-auto  border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50  shadow-sm rounded-md">
					<SelectValue>
						<span className="font-medium">{currentModel?.name || "Select Model"}</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent className="w-80">
					{filteredModels.map((model: ModelType) => (
						<SelectItem 
							className="p-3 cursor-pointer hover:bg-slate-50"
							key={model.id} 
							value={model.id}
						>
							<div className="w-full space-y-2">
								{/* Header with name */}
								<div className="flex items-center justify-between">
									<span className="font-medium text-sm">{model.name}</span>
								</div>
								{/* Description */}
								<p className="text-xs text-gray-600 leading-relaxed">
									{model.description}
								</p>
								{/* Metrics row - only speed and quality */}
								<div className="flex items-center gap-6">
									{/* Speed */}
									<div className="flex items-center gap-1">
										<Zap className="h-3 w-3 text-yellow-500" />
										<RatingStars rating={model.speed} />
										<span className="text-xs text-gray-500">Speed</span>
									</div>
									{/* Performance */}
									<div className="flex items-center gap-1">
										<Target className="h-3 w-3 text-blue-500" />
										<RatingStars rating={model.performance} />
										<span className="text-xs text-gray-500">Quality</span>
									</div>
								</div>
								{/* Best for */}
								<div className="bg-slate-50 rounded-md p-2">
									<div className="flex items-start gap-2">
										<Star className="h-3 w-3 text-indigo-500 mt-0.5 flex-shrink-0" />
										<span className="text-xs text-slate-700 font-medium">
															Best for: {model.bestFor}
										</span>
									</div>
								</div>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>

	);
}