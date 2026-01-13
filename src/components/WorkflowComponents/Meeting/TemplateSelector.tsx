import React, { useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
	EMAIL_TEMPLATES, 
	SAMPLE_TEMPLATE_DATA, 
	renderTemplate,
} from "./emailTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplateSelectorProps {
	selectedTemplate: string;
	onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
	selectedTemplate,
	onSelect,
}) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	
	// Track which template is currently in view (separate from selection)
	const [viewIndex, setViewIndex] = useState(() => {
		const idx = EMAIL_TEMPLATES.findIndex(t => t.id === selectedTemplate);
		return idx >= 0 ? idx : 0;
	});

	// Generate previews for all templates
	const templatePreviews = useMemo(() => {
		return EMAIL_TEMPLATES.map(template => ({
			...template,
			previewHtml: renderTemplate(template.html, SAMPLE_TEMPLATE_DATA),
		}));
	}, []);

	const scrollToTemplate = (index: number) => {
		if (scrollContainerRef.current) {
			const container = scrollContainerRef.current;
			const child = container.children[index] as HTMLElement;
			if (child) {
				container.scrollTo({
					left: child.offsetLeft - 16,
					behavior: "smooth",
				});
			}
		}
		setViewIndex(index);
	};

	const goToPrev = () => {
		const prevIndex = viewIndex > 0 ? viewIndex - 1 : templatePreviews.length - 1;
		scrollToTemplate(prevIndex);
	};

	const goToNext = () => {
		const nextIndex = viewIndex < templatePreviews.length - 1 ? viewIndex + 1 : 0;
		scrollToTemplate(nextIndex);
	};

	const currentViewTemplate = templatePreviews[viewIndex] || templatePreviews[0];

	return (
		<div className="h-full flex flex-col">
			{/* Header with navigation */}
			<div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 className="text-sm font-medium text-gray-900">{currentViewTemplate.name}</h3>
					{currentViewTemplate.description && (
						<p className="text-xs text-gray-500 mt-0.5">{currentViewTemplate.description}</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					{/* Template dots indicator */}
					<div className="flex items-center gap-1.5 mr-2">
						{templatePreviews.map((template, idx) => (
							<button
								key={template.id}
								onClick={() => scrollToTemplate(idx)}
								className={`
									w-2 h-2 rounded-full transition-all
									${viewIndex === idx 
										? "bg-blue-500 w-4" 
										: "bg-gray-300 hover:bg-gray-400"
									}
								`}
								title={template.name}
							/>
						))}
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={goToPrev}
						className="h-8 w-8"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={goToNext}
						className="h-8 w-8"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Full preview with horizontal scroll */}
			<div 
				ref={scrollContainerRef}
				className="flex-1 flex gap-4 overflow-x-auto pt-4 snap-x snap-mandatory scrollbar-hide"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{templatePreviews.map((template) => {
					const isSelected = selectedTemplate === template.id;
					return (
						<div
							key={template.id}
							onClick={() => onSelect(template.id)}
							className={`
								flex-shrink-0 w-full rounded-lg overflow-hidden cursor-pointer transition-all snap-center
							`}
						>
							<ScrollArea className="h-[80vh] overflow-hidden bg-white relative">
								<iframe
									srcDoc={template.previewHtml}
									className="w-full h-[1000vh] border-0 pointer-events-none"
									title={`${template.name} Preview`}
									style={{ 
										transform: "scale(0.9)", 
										transformOrigin: "top left", 
										
									}}
								/>
								{/* Selection checkbox - always visible */}
								<button
									onClick={(e) => {
										e.stopPropagation();
										onSelect(template.id);
									}}
									className={`
										absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full shadow-sm transition-all
										${isSelected 
											? "bg-blue-500 text-white" 
											: "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
										}
									`}
								>
									<div className={`
										w-4 h-4 rounded border-2 flex items-center justify-center transition-all
										${isSelected 
											? "bg-white border-white" 
											: "border-gray-400 bg-transparent"
										}
									`}>
										{isSelected && <Check className="h-3 w-3 text-blue-500" />}
									</div>
									<span className="text-xs font-medium">
										{isSelected ? "Selected" : "Select"}
									</span>
								</button>
							</ScrollArea>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TemplateSelector;
