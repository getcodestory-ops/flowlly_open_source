import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, FileSpreadsheet, FileText, FileCode, Search, Users, ArrowLeft, Sparkles, Plus, X, Scale, Calendar, Wand2, Upload, Info } from "lucide-react";
import AtSelectorComponent from "../../../components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import { useViewStore } from "@/utils/store";
import ModelSelector from "../../../components/ModelSelector";
import AgentTypeSelector from "../../../components/AgentTypeSelector";
import BidLevelling from "./FormDirectives/BidLevelling";
import BidLevelling2 from "./FormDirectives/BidLevelling2";
import DailyReport from "./FormDirectives/DailyReport";
import ReportWriting from "./FormDirectives/ReportWriting";
import KnowledgeManager from "./FormDirectives/KnowledgeManager";
import MeetingChat from "./FormDirectives/MeetingChat";
import DocumentGeneration from "./FormDirectives/DocumentGeneration";
import { useTemplatesByUseCase } from "@/hooks/useTemplates";
import type { TemplatePreview, StorageResourceEntity } from "@/api/templateRoutes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import TemplateBuilder from "./TemplateBuilder";
import TemplateFromExistingReport from "./FormDirectives/TemplateFromExistingReport";
import { toast } from "@/components/ui/use-toast";

// Reusable Form Wrapper Component with fixed back button
const FormWrapper = ({ 
	children, 
	onBack 
}: { 
	children: React.ReactNode; 
	onBack: () => void;
}): React.JSX.Element => {
	return (
		<ScrollArea className="h-full w-full" scrollbarClassName="!fixed !right-0 !top-0 !h-screen">
			{/* Fixed back button - stays visible while scrolling (desktop only) */}
			<button
				onClick={onBack}
				className="relative top-24 translate-x-0 z-20 p-2 text-gray-600 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors hidden lg:flex items-center gap-1"
				title="Back to templates"
			>
				<ArrowLeft className="h-6 w-6" />
			</button>
			<div className="py-8 px-4">
				{/* Mobile back button - scrolls with content */}
				<div className="max-w-[816px] mx-auto">
					<button
						onClick={onBack}
						className="lg:hidden mb-4 p-2 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="text-sm">Back</span>
					</button>
				</div>
				{children}
			</div>
		</ScrollArea>
	);
};

// Placeholder texts constant
const PLACEHOLDER_TEXTS = [
	"✨ Type your task and provide necessary files and folders...",
	"📎 Click the clip icon below to select files for the agent to analyze...",
	"📁 Set your output folder by clicking the clip icon and choosing 'Chat Folder'...",
	"☁️ Upload documents to your project folders via the document panel...",
	"🚀 Describe what you need help with - reports, analysis, estimates...",
	"💼 Attach blueprints, contracts, or specifications for better results...",
];

// Animated Placeholder Component
const AnimatedPlaceholder = ({ isEmpty }: { isEmpty: boolean }): React.JSX.Element | null => {
	const [currentText, setCurrentText] = React.useState("");
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [isTyping, setIsTyping] = React.useState(true);

	React.useEffect(() => {
		if (!isEmpty) return;

		const currentFullText = PLACEHOLDER_TEXTS[currentIndex];
		
		if (isTyping) {
			if (currentText.length < currentFullText.length) {
				const timeout = setTimeout(() => {
					setCurrentText(currentFullText.slice(0, currentText.length + 1));
				}, 50);
				return () => clearTimeout(timeout);
			} else {
				const timeout = setTimeout(() => {
					setIsTyping(false);
				}, 2500);
				return () => clearTimeout(timeout);
			}
		} else {
			if (currentText.length > 0) {
				const timeout = setTimeout(() => {
					setCurrentText(currentText.slice(0, -1));
				}, 25);
				return () => clearTimeout(timeout);
			} else {
				setCurrentIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
				setIsTyping(true);
			}
		}
	}, [currentText, currentIndex, isTyping, isEmpty]);

	if (!isEmpty) return null;

	return (
		<div className="absolute inset-0 flex items-start px-4 pl-12 pt-8 pointer-events-none">
			<span className="text-slate-400 text-sm font-medium leading-relaxed">
				{currentText}
				<span className="animate-pulse text-indigo-400">|</span>
			</span>
		</div>
	);
};



interface EmptyChatInterfaceProps {
	chatInput: string;
	setChatInput: (value: string) => void;
	isPending: boolean;
	isWaitingForResponse: boolean;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
	isDragging?: boolean;
}

export default function EmptyChatInterface({
	chatInput,
	setChatInput,
	isPending,
	isWaitingForResponse,
	handleSubmit,
	loadDocumentPanel,
	textareaRef,
	isDragging = false,
}: EmptyChatInterfaceProps): React.JSX.Element {
	const { 
		chatDirectiveType, 
		setChatDirectiveType, 
		// selectedTemplateId, // No longer needed
		setSelectedTemplateId,
		chatContext,
		setChatContext,
		clearChatContext,
	} = useChatStore();
	const { preferredModel, setPreferredModel, preferredAgentType, setPreferredAgentType } = useViewStore();
	const localTextareaRef = React.useRef<HTMLTextAreaElement>(null);
	const activeTextareaRef = textareaRef || localTextareaRef;
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const [selectedTemplateName, setSelectedTemplateName] = React.useState<string | null>(null);

	// Auto-expand textarea as text grows
	React.useEffect(() => {
		const textarea = activeTextareaRef.current;
		if (textarea) {
			// Reset height to auto to get the correct scrollHeight
			textarea.style.height = "auto";
			// Set height to scrollHeight with min and max constraints
			const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 400); 
			textarea.style.height = `${newHeight}px`;
		}
	}, [chatInput]);


	// Template hooks - must be declared before any conditional returns
	const { data: templatesByUseCase, isLoading: templatesLoading, templates: allTemplates } = useTemplatesByUseCase();

	// Chat types for template cards
	interface TemplateCard {
		id: "bidLevelling" | "bidLevelling2" | "dailyReport" | "reportWriting" | "knowledgeManager" | "meetingChat" | "documentGeneration" | "template" | "templateCreate" | "templateCreateAI" | "none";
		title: string;
		subtitle: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
		accentColor: string;
		previewLines: string[];
		templateId?: string;
		useCase?: string;
	}

	interface TemplateCategory {
		id: string;
		label: string;
		color: string;
		templates: TemplateCard[];
		isLoading?: boolean;
	}

	// Create template categories organized like Google Docs
	const templateCategories = React.useMemo((): TemplateCategory[] => {
		const categories: TemplateCategory[] = [
			{
				id: "bidding",
				label: "Bid Analysis",
				color: "emerald",
				templates: [
					{
						id: "bidLevelling",
						title: "Quick Comparison",
						subtitle: "Bid Levelling",
						description: "Compare contractor bids side-by-side with variance highlights",
						icon: Scale,
						accentColor: "emerald",
						previewLines: ["1. Bid Summary Table", "2. Price Comparison", "3. Scope Variance", "4. Recommendation"],
					},
					{
						id: "bidLevelling2",
						title: "Comprehensive Analysis",
						subtitle: "Deep Dive",
						description: "Full multi-factor evaluation with risk scoring",
						icon: FileSpreadsheet,
						accentColor: "emerald",
						previewLines: ["Executive Summary", "Line Item Breakdown", "Risk Matrix", "Award Analysis"],
					},
				],
			},
			{
				id: "reports",
				label: "Reports",
				color: "blue",
				templates: [
					{
						id: "dailyReport",
						title: "Daily Progress Report",
						subtitle: "Site Report",
						description: "Generate formatted daily reports from site data",
						icon: Calendar,
						accentColor: "blue",
						previewLines: ["Weather & Conditions", "Crew & Equipment", "Work Completed", "Issues & RFIs"],
					},
				],
			},
			{
				id: "research",
				label: "Research & Search",
				color: "violet",
				templates: [
					{
						id: "knowledgeManager",
						title: "Document Search",
						subtitle: "Knowledge Base",
						description: "Search and summarize across all project files",
						icon: Search,
						accentColor: "violet",
						previewLines: ["Search Query", "Matching Documents", "Key Excerpts", "AI Summary"],
					},
					{
						id: "meetingChat",
						title: "Meeting Assistant",
						subtitle: "Transcript Analysis",
						description: "Ask questions about meetings and decisions",
						icon: Users,
						accentColor: "violet",
						previewLines: ["Meeting Overview", "Participants", "Decisions Made", "Action Items"],
					},
				],
			},
			{
				id: "creation",
				label: "Document Creation",
				color: "amber",
				templates: [
					{
						id: "documentGeneration",
						title: "Generate Document",
						subtitle: "New Document",
						description: "Create professionally formatted documents",
						icon: FileText,
						accentColor: "amber",
						previewLines: ["Document Title", "Section Headers", "Body Content", "Attachments"],
					},
				],
			},
			{
				id: "custom",
				label: "Custom Templates",
				color: "slate",
				templates: [
					{
						id: "templateCreate",
						title: "Template Builder",
						subtitle: "Manual Design",
						description: "Build reusable templates from scratch",
						icon: Plus,
						accentColor: "slate",
						previewLines: ["Define Sections", "Add Input Fields", "Set Formatting", "Save & Reuse"],
					},
					{
						id: "templateCreateAI",
						title: "AI Template Creator",
						subtitle: "From Example",
						description: "Upload a report and AI creates the template",
						icon: Wand2,
						accentColor: "rose",
						previewLines: ["Upload Sample PDF", "AI Extracts Structure", "Review Template", "Customize Fields"],
					},
				],
			},
		];

		// Add user's saved templates - always include section to prevent layout shift
		const savedTemplateCards: TemplateCard[] = templatesByUseCase 
			? Object.entries(templatesByUseCase).flatMap(([useCase, templates]) => 
				(templates as TemplatePreview[]).map((template: TemplatePreview) => ({
					id: "template" as const,
					title: template.name,
					subtitle: "Saved Template",
					description: template.description || useCase,
					icon: Sparkles,
					accentColor: "indigo",
					previewLines: ["Template Header", "Custom Sections", "Your Fields", "Quick Generate"],
					templateId: template.id,
					useCase,
				})),
			)
			: [];
		
		// Always add the "Your Templates" section to prevent layout shift
		// Show all templates but container is width-constrained to show ~3 at a time
		categories.push({
			id: "saved",
			label: "Your Templates",
			color: "indigo",
			templates: savedTemplateCards,
			isLoading: templatesLoading,
		});
		
		return categories;
	}, [templatesByUseCase, templatesLoading]);


	const handleTemplateSelection = React.useCallback((template: StorageResourceEntity) => {
		setChatDirectiveType("chat");
		// Auto-set to agent mode since templates require agent
		setPreferredAgentType("agent");

		// Add instruction directly to chat input
		const templateContent = template.metadata.content || "";
		setChatContext(":::instructions\n" + templateContent + "\n:::\n");
		setChatInput("Execute instructions");

		// Save the template name for display
		setSelectedTemplateName(template.metadata.template_name || template.file_name || "Template");

		// Reset template selection
		setSelectedTemplateId(null);

		// Scroll to top to show the populated chat input
		// ScrollArea uses Radix, the actual scrollable element is the Viewport inside
		setTimeout(() => {
			const viewport = scrollContainerRef.current?.querySelector("[data-radix-scroll-area-viewport]");
			if (viewport) {
				viewport.scrollTo({ top: 0, behavior: "smooth" });
			}
		}, 100);

		// Show toast notification
		toast({
			title: "Template loaded! 🎉",
			description: "Select documents using the clip icon, then click Send to run your template",
			duration: 8000,
		});
	}, [
		setSelectedTemplateId,
		setChatDirectiveType,
		setChatContext,
		setChatInput,
		setPreferredAgentType,
	]);

	


	if (chatDirectiveType === "bidLevelling") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<BidLevelling
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	if (chatDirectiveType === "bidLevelling2") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<BidLevelling2
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}
	// If daily report is selected, show only the form with back
	if (chatDirectiveType === "dailyReport") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<DailyReport
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// If report writing is selected, show only the form with back
	if (chatDirectiveType === "reportWriting") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<ReportWriting
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// If knowledge manager is selected, show only the form with back
	if (chatDirectiveType === "knowledgeManager") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<KnowledgeManager
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// If meeting chat is selected, show only the form with back
	if (chatDirectiveType === "meetingChat") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<MeetingChat
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// If user wants to create a template, show Template Builder
	if (chatDirectiveType === "templateCreate") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<div className="max-w-[816px] mx-auto">
					<TemplateBuilder
						onCreated={(template) => {
							handleTemplateSelection(template);
						}}
					/>
				</div>
			</FormWrapper>
		);
	}

	// If AI template creation is selected, show only the form with back
	if (chatDirectiveType === "templateCreateAI") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<TemplateFromExistingReport 
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// If document generation is selected, show only the form with back
	if (chatDirectiveType === "documentGeneration") {
		return (
			<FormWrapper onBack={() => setChatDirectiveType("none")}>
				<DocumentGeneration
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</FormWrapper>
		);
	}

	// Color mapping for document titles
	const titleColorClasses: Record<string, string> = {
		emerald: "text-emerald-600",
		blue: "text-blue-600",
		violet: "text-violet-600",
		amber: "text-amber-600",
		slate: "text-slate-600",
		rose: "text-rose-600",
		indigo: "text-indigo-600",
	};

	// Document-style template card component
	const TemplateDocCard = ({ template, onClick }: { template: TemplateCard; onClick: () => void }) => {
		const titleColor = titleColorClasses[template.accentColor] || titleColorClasses.slate;
		
		return (
			<button
				className="group flex flex-col text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-sm"
				onClick={onClick}
			>
				{/* Document Preview - Clean white paper look */}
				<div className="relative w-[210px] h-[270px] rounded-sm border border-gray-200 bg-white shadow-sm group-hover:shadow-lg group-hover:border-indigo-400 transition-all duration-200 overflow-hidden">
					{/* Document content - looks like real document */}
					<div className="p-5 h-full flex flex-col">
						{/* Colorful title inside document */}
						<h3 className={`text-[13px] font-bold ${titleColor} mb-2.5 leading-tight`}>
							{template.title}
						</h3>
						
						{/* Subtitle / description line */}
						<p className="text-[9px] text-gray-500 mb-4 leading-relaxed">
							{template.description}
						</p>
						
						{/* Preview content lines - looks like document sections */}
						<div className="space-y-3 flex-1">
							{template.previewLines.map((line, idx) => (
								<div key={idx}>
									<div className="text-[8px] font-medium text-gray-600 mb-0.5">{line}</div>
									<div className="h-1.5 bg-gray-100 rounded-full" style={{ width: `${85 - (idx * 8)}%` }} />
								</div>
							))}
						</div>
						
						{/* Bottom faux content */}
						<div className="mt-auto pt-3 space-y-1.5">
							<div className="h-1.5 bg-gray-50 rounded-full w-full" />
							<div className="h-1.5 bg-gray-50 rounded-full w-3/4" />
						</div>
					</div>
					
					{/* Hover overlay */}
					<div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-200" />
				</div>
			</button>
		);
	};

	// Otherwise, show the full chat interface
	return (
		<ScrollArea className="h-full w-full" scrollbarClassName="!fixed !right-0 !top-0 !h-screen" ref={scrollContainerRef}>
			<div className="flex flex-col items-center px-4 py-8">
				{/* Header Section */}
				<div className="w-full max-w-4xl mb-10">
					<h1 className="text-4xl font-bold text-gray-500 mb-4">
					Hi, What can I do for you?
					</h1>
					<p className="text-gray-600 text-lg">
						Type a message or choose a template to begin
					</p>
				</div>

				{/* Chat Input */}
				<div className="w-full max-w-4xl mb-12">
					<div className={`relative overflow-hidden rounded-xl bg-white border shadow-sm transition-all ${
						isDragging 
							? "border-indigo-400 ring-2 ring-indigo-300 border-dashed" 
							: "border-slate-200 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-300"
					}`}>
						{/* Drag overlay for chat input area */}
						{isDragging && (
							<div className="absolute inset-0 z-20 flex items-center justify-center bg-indigo-50/95 backdrop-blur-sm">
								<div className="flex flex-col items-center gap-2 text-indigo-600">
									<Upload className="h-10 w-10 animate-bounce" />
									<span className="text-base font-medium">Drop files here to attach</span>
									<span className="text-xs text-indigo-500">
										Images, PDFs, documents, audio & more
									</span>
								</div>
							</div>
						)}
						<Label className="sr-only" htmlFor="empty-message">
							Message
						</Label>
						<div className="absolute top-0 left-2 z-10 pt-2">
							<div className="flex items-center gap-2">
								<AtSelectorComponent />
								{chatContext.trim() && (
									<Badge 
										className="h-5 px-2 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer max-w-[200px] group"
										onClick={() => {
											clearChatContext();
											setSelectedTemplateName(null);
										}}
										variant="secondary"
									>
										<X className="h-3 w-3 text-indigo-600 flex-shrink-0" />
										<Sparkles className="h-3 w-3 text-indigo-600 flex-shrink-0" />
										<span className="truncate" title={selectedTemplateName || "Template Instructions"}>
											{selectedTemplateName || "Template"}
										</span>
									</Badge>
								)}
							</div>
						</div>
						<div className="relative">
							<AnimatedPlaceholder isEmpty={!chatInput.trim()} />
							<Textarea
								className="min-h-20 resize-none border-0 p-4 pl-12 mt-4 shadow-none focus-visible:ring-0 text-slate-800 bg-transparent text-base"
								disabled={isPending}
								id="empty-message"
								onChange={(e) => setChatInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSubmit();
									}
								}}
								ref={activeTextareaRef}
								style={{ height: "auto" }}
								value={chatInput}
							/>
						</div>
						<div className="flex items-center justify-between p-4 pt-0">
							<div className="flex items-center gap-2">
								{loadDocumentPanel()}
								<AgentTypeSelector 
									onAgentTypeChange={setPreferredAgentType}
									selectedAgentType={preferredAgentType}
									isLocked={false}
								/>
								<ModelSelector 
									onModelChange={setPreferredModel}
									selectedModel={preferredModel}
									selectedAgentType={preferredAgentType}
								/>
							</div>
							<Button
								className="gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
								disabled={isPending || !chatInput.trim()}
								onClick={handleSubmit}
								size="sm"
								type="submit"
							>
								{isPending ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<>
										Send
										<CornerDownLeft className="h-3.5 w-3.5" />
									</>
								)}
							</Button>
						</div>
						{/* Chat mode limitation notice */}
						{preferredAgentType === "chat" && (
							<div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
								<Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
								<p className="text-xs leading-relaxed">
									<span className="font-medium">Chat mode</span> is optimized for quick Q&A. For document generation, complex formatting, research, or working with files, switch to <button 
										onClick={() => setPreferredAgentType("agent")}
										className="font-semibold text-purple-700 hover:text-purple-900 underline underline-offset-2"
									>Agent mode</button>.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Template Gallery - Google Docs Style */}
				<div className="w-full max-w-6xl space-y-4 pb-8">
					{templateCategories.map((category) => {
						const categoryTitleColor = titleColorClasses[category.color] || titleColorClasses.slate;
						// Constrain "Your Templates" width to show ~3 cards (prevents layout shift)
						const scrollAreaClass = category.id === "saved" ? "w-full max-w-[690px]" : "w-full";
						return (
						<div key={category.id}>
							{/* Category Header - Colorful */}
							<h2 className={`text-sm font-semibold ${categoryTitleColor} mb-3 uppercase tracking-wide`}>
								{category.label}
							</h2>
							
							{/* Horizontal Scrolling Template Cards */}
							<ScrollArea className={scrollAreaClass}>
								<div className="flex gap-5 pb-2 min-h-[280px]">
									{category.isLoading ? (
										// Loading skeleton for "Your Templates"
										<>
											{[1, 2, 3].map((i) => (
												<div 
													key={i} 
													className="w-[210px] h-[270px] rounded-sm border border-gray-200 bg-gray-50 animate-pulse flex-shrink-0"
												/>
											))}
										</>
									) : category.templates.length === 0 && category.id === "saved" ? (
										// Empty state for "Your Templates"
										<div className="flex items-center justify-center w-full h-[270px] text-gray-400 text-sm">
											No saved templates yet
										</div>
									) : (
										category.templates.map((template, idx) => (
											<TemplateDocCard
												key={`${template.id}-${template.templateId || idx}`}
												onClick={() => {
													if (template.id === "template" && template.templateId) {
														const fullTemplate = allTemplates?.find((t) => t.id === template.templateId);
														if (fullTemplate) {
															handleTemplateSelection(fullTemplate);
														}
													} else {
														// Auto-set to agent mode since templates require agent
														setPreferredAgentType("agent");
														setChatDirectiveType(template.id);
													}
												}}
												template={template}
											/>
										))
									)}
								</div>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</div>
					);
					})}
				</div>
			</div>
		</ScrollArea>
	);
}
