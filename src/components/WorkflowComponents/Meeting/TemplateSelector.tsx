import React, { useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Paperclip, Upload, X } from "lucide-react";
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
	customPrompt?: string;
	onCustomPromptChange?: (prompt: string) => void;
	attachments?: Array<{ id: string; name: string }>;
	isUploadingAttachments?: boolean;
	onUploadAttachments?: (files: File[]) => void | Promise<void>;
	onRemoveAttachment?: (attachmentId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
	selectedTemplate,
	onSelect,
	customPrompt = "",
	onCustomPromptChange,
	attachments = [],
	isUploadingAttachments = false,
	onUploadAttachments,
	onRemoveAttachment,
}) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const attachmentInputRef = useRef<HTMLInputElement>(null);
	const [isAttachmentDragOver, setIsAttachmentDragOver] = useState(false);
	
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

	const handleAttachmentDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsAttachmentDragOver(false);
		if (!onUploadAttachments) return;
		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			void onUploadAttachments(Array.from(files));
		}
	};

	const handleAttachmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!onUploadAttachments || !e.target.files || e.target.files.length === 0) return;
		void onUploadAttachments(Array.from(e.target.files));
		e.target.value = "";
	};

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
					const isCustomTemplate = template.id === "custom";
					
					return (
						<div
							key={template.id}
							onClick={() => !isCustomTemplate && onSelect(template.id)}
							className={`
								flex-shrink-0 w-full rounded-lg overflow-hidden transition-all snap-center
								${!isCustomTemplate ? "cursor-pointer" : ""}
							`}
						>
							<ScrollArea className="h-[80vh] overflow-hidden bg-white relative">
								{isCustomTemplate ? (
									// Custom template - show editable prompt area
									<div className="p-6 h-full flex flex-col">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-900 mb-2">Custom Template</h2>
											<p className="text-sm text-gray-500">
												Write your own instructions to customize how meeting minutes are generated
											</p>
										</div>
										
										<div className="flex-1 flex flex-col">
											<textarea
												value={customPrompt}
												onChange={(e) => onCustomPromptChange?.(e.target.value)}
												onClick={(e) => e.stopPropagation()}
												placeholder="Describe how you want your meeting minutes formatted. For example:

• Focus on action items and decisions made
• Use bullet points for easy scanning
• Include a brief executive summary at the top
• Highlight any blockers or risks mentioned
• Group discussions by topic
• List attendees and their contributions
• Add timestamps for key moments"
												className="flex-1 min-h-[200px] w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
											/>
											<p className="mt-2 text-xs text-gray-500">
												Your instructions will guide the AI in generating the meeting minutes format and content emphasis.
											</p>
											<div className="mt-4">
												<input
													hidden
													multiple
													onChange={handleAttachmentInputChange}
													ref={attachmentInputRef}
													type="file"
												/>
												<div
													className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
														isAttachmentDragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
													}`}
													onDragEnter={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setIsAttachmentDragOver(true);
													}}
													onDragLeave={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setIsAttachmentDragOver(false);
													}}
													onDragOver={(e) => {
														e.preventDefault();
														e.stopPropagation();
													}}
													onDrop={handleAttachmentDrop}
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex items-start gap-2">
															<Upload className="h-4 w-4 mt-0.5 text-gray-500" />
															<div>
																<p className="text-sm font-medium text-gray-700">
																	Attach reference files
																</p>
																<p className="text-xs text-gray-500">
																	Drop files here or browse to attach documents for your custom prompt.
																</p>
															</div>
														</div>
														<Button
															className="h-7"
															onClick={(e) => {
																e.stopPropagation();
																attachmentInputRef.current?.click();
															}}
															size="sm"
															type="button"
															variant="outline"
														>
															<Paperclip className="h-3.5 w-3.5 mr-1.5" />
															Add files
														</Button>
													</div>
													{attachments.length > 0 && (
														<div className="mt-3 space-y-1.5">
															{attachments.map((attachment) => (
																<div
																	key={attachment.id}
																	className="flex items-center justify-between rounded bg-white px-2 py-1.5 border"
																>
																	<span className="text-xs text-gray-700 truncate pr-2">
																		{attachment.name}
																	</span>
																	<Button
																		className="h-6 w-6 p-0"
																		onClick={(e) => {
																			e.stopPropagation();
																			onRemoveAttachment?.(attachment.id);
																		}}
																		size="icon"
																		type="button"
																		variant="ghost"
																	>
																		<X className="h-3.5 w-3.5" />
																	</Button>
																</div>
															))}
														</div>
													)}
													{isUploadingAttachments && (
														<p className="mt-2 text-xs text-blue-600">Uploading attachment(s)...</p>
													)}
												</div>
											</div>
										</div>
									</div>
								) : (
									// Regular template - show preview iframe
									<iframe
										srcDoc={template.previewHtml}
										className="w-full h-[1000vh] border-0 pointer-events-none"
										title={`${template.name} Preview`}
										style={{ 
											transform: "scale(0.9)", 
											transformOrigin: "top left", 
										}}
									/>
								)}
								
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
