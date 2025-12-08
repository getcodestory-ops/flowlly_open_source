import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, FileSpreadsheet, FileText, FileCode, Search, MessageSquare, Users, ArrowLeft, Sparkles, Plus, X } from "lucide-react";
import AtSelectorComponent from "../../../components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import ModelSelector from "../../../components/ModelSelector";
import AgentTypeSelector from "../../../components/AgentTypeSelector";
import { MODELS } from "../../types";
import BidLevelling from "./FormDirectives/BidLevelling";
import BidLevelling2 from "./FormDirectives/BidLevelling2";
import DailyReport from "./FormDirectives/DailyReport";
import ReportWriting from "./FormDirectives/ReportWriting";
import KnowledgeManager from "./FormDirectives/KnowledgeManager";
import MeetingChat from "./FormDirectives/MeetingChat";
import DocumentGeneration from "./FormDirectives/DocumentGeneration";
import { useTemplatesByUseCase } from "@/hooks/useTemplates";
import type { TemplatePreview, StorageResourceEntity } from "@/api/templateRoutes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import TemplateBuilder from "./TemplateBuilder";
import TemplateFromExistingReport from "./FormDirectives/TemplateFromExistingReport";

// Icon mapping for dynamic loading
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	MessageSquare,
	FileSpreadsheet,
	FileText,
	FileCode,
	Search,
	Users,
};

// Helper function to get icon component from string
const GET_ICON_COMPONENT = (iconName: string): React.ComponentType<{ className?: string }> => {
	return iconMap[iconName] || MessageSquare;
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
}

export default function EmptyChatInterface({
	chatInput,
	setChatInput,
	isPending,
	isWaitingForResponse,
	handleSubmit,
	loadDocumentPanel,
	textareaRef,
}: EmptyChatInterfaceProps): React.JSX.Element {
	const { 
		chatDirectiveType, 
		setChatDirectiveType, 
		selectedModel, 
		setSelectedModel,
		selectedAgentType,
		setSelectedAgentType,
		// selectedTemplateId, // No longer needed
		setSelectedTemplateId,
		chatContext,
		setChatContext,
		clearChatContext,
	} = useChatStore();
	const localTextareaRef = React.useRef<HTMLTextAreaElement>(null);
	const activeTextareaRef = textareaRef || localTextareaRef;
	const [activeTab, setActiveTab] = React.useState("chat");

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

	useEffect(() => {
		if (selectedAgentType === "agent" && selectedModel === "OpenAI-gpt-5") {
			// GPT-5 is not available in agent mode, switch to the first available model
			const agentModels = MODELS.filter((model: { id: string }) => model.id !== "OpenAI-gpt-5");
			if (agentModels.length > 0) {
				setSelectedModel(agentModels[0].id);
			}
		}
	}, [selectedAgentType, selectedModel, setSelectedModel]);

	// Template hooks - must be declared before any conditional returns
	const { data: templatesByUseCase, isLoading: templatesLoading, templates: allTemplates } = useTemplatesByUseCase();

	// Chat types for each tab
	interface ChatTypeCard {
		id: "bidLevelling" | "bidLevelling2" | "dailyReport" | "reportWriting" | "knowledgeManager" | "meetingChat" | "documentGeneration" | "template" | "templateCreate" | "templateCreateAI" | "none";
		title: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
		templateId?: string;
		useCase?: string;
	}

	// Create dynamic chat types with templates (hook: useMemo)
	const dynamicChatTypes = React.useMemo(() => {
		const chatTypes: Record<string, Array<ChatTypeCard>> = {
			bidLevelling: [
				{
					id: "bidLevelling",
					title: "Bid Levelling Fast",
					description: "Analyze and compare bids",
					icon: FileSpreadsheet,
				},
				{
					id: "bidLevelling2",
					title: "Bid Levelling Comprehensive",
					description: "Analyze and compare bids in a comprehensive way",
					icon: FileSpreadsheet,
				},
			],
			reports: [
				{
					id: "dailyReport",
					title: "Daily Report",
					description: "Generate daily progress reports",
					icon: FileText,
				},
			],
			search: [
				{
					id: "knowledgeManager",
					title: "Knowledge Search",
					description: "Search project documents",
					icon: Search,
				},
			],
			meeting: [
				{
					id: "meetingChat",
					title: "Meeting Assistant",
					description: "Ask about meetings and transcripts",
					icon: Users,
				},
			],
			documents: [
				{
					id: "documentGeneration",
					title: "Document Generation",
					description: "Create new documents in sandbox",
					icon: FileCode,
				},
			],
			templates: [], // Will be populated dynamically
		};

		const baseTypes = { ...chatTypes };
		
		// Add dynamic templates
		if (!templatesLoading && templatesByUseCase) {
			const templateCards: ChatTypeCard[] = Object.entries(templatesByUseCase).flatMap(([useCase, templates]) => 
				(templates as TemplatePreview[]).map((template: TemplatePreview) => ({
					id: "template" as const,
					title: template.name,
					description: template.description || useCase,
					icon: Sparkles,
					templateId: template.id,
					useCase,
				})),
			);
			// Prepend a "Create Template" card
			baseTypes.templates = [
				{
					id: "templateCreate",
					title: "Create Template (Manual)",
					description: "Design a new report template with the builder",
					icon: Plus,
				},
				{
					id: "templateCreateAI",
					title: "Create Template (AI)",
					description: "Attach an existing report; AI drafts the template",
					icon: Sparkles,
				},
				...templateCards,
			];
		}
		
		return baseTypes;
	}, [templatesByUseCase, templatesLoading]);

	// Tab configuration
	const tabTypes = [
		{
			id: "bidLevelling",
			label: "Bid Levelling",
			icon: FileSpreadsheet,
		},
		{
			id: "reports",
			label: "Reports",
			icon: FileText,
		},
		{
			id: "search",
			label: "Search",
			icon: Search,
		},
		{
			id: "meeting",
			label: "Meeting",
			icon: Users,
		},
		{
			id: "documents",
			label: "Documents",
			icon: FileCode,
		},
		{
			id: "templates",
			label: "Templates",
			icon: Sparkles,
		},
	];

	// Static fallback configuration (current system)
	const staticTabTypes = tabTypes;
	const staticChatTypes = dynamicChatTypes;


	const handleTemplateSelection = React.useCallback((template: StorageResourceEntity) => {


		setChatDirectiveType("chat");

		// Add instruction directly to chat input
		const templateContent = template.metadata.content || "";
		setChatContext(":::instructions\n" + templateContent + "\n:::\n");
		setChatInput("Execute instructions");

		// Reset template selection
		setSelectedTemplateId(null);
	}, [
		setSelectedTemplateId,
		setChatDirectiveType,
		setChatContext,
	]);

	


	if (chatDirectiveType === "bidLevelling") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<BidLevelling
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			
			</div>
		);
	}

	if (chatDirectiveType === "bidLevelling2") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<BidLevelling2
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			
			</div>
		);
	}
	// If daily report is selected, show only the form with back
	if (chatDirectiveType === "dailyReport") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<DailyReport
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If report writing is selected, show only the form with back
	if (chatDirectiveType === "reportWriting") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<ReportWriting
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If knowledge manager is selected, show only the form with back
	if (chatDirectiveType === "knowledgeManager") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<KnowledgeManager
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If meeting chat is selected, show only the form with back
	if (chatDirectiveType === "meetingChat") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<MeetingChat
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If user wants to create a template, show Template Builder
	if (chatDirectiveType === "templateCreate") {
		return (
			<div className="flex flex-col items-center px-4 py-6 ">
				<div className="w-full mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<div className="w-full">
					<TemplateBuilder
						onCreated={(template) => {
							handleTemplateSelection(template);
						}}
					/>
				</div>
			</div>
		);
	}

	// If AI template creation is selected, show only the form with back
	if (chatDirectiveType === "templateCreateAI") {
		return (
			<div className="flex flex-col items-center px-4 py-6 ">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<TemplateFromExistingReport 
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If document generation is selected, show only the form with back
	if (chatDirectiveType === "documentGeneration") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<div className="w-full max-w-3xl mb-4">
					<button
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
						onClick={() => setChatDirectiveType("none")}
					>
						<ArrowLeft className="h-4 w-4" /> Back
					</button>
				</div>
				<DocumentGeneration
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// Otherwise, show the full chat interface
	return (
		<ScrollArea className="flex flex-col items-center justify-center  px-4 py-6 w-full">

			<div className="w-full max-w-3xl mb-8 p-2"> {/* Centered Chat Input */}
				<div className="w-full mb-12"> 
					<h1 className="text-4xl font-bold text-gray-500 mb-4">
					Hi, What can I do for you?
					</h1>
					<p className="text-gray-600 text-lg">
					Start by typing your task and providing necessary files and folders...
					</p>
					<p className="text-gray-400 text-md">
						or select a chat type below to get started
					</p>
				</div>
				<div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
					<Label className="sr-only" htmlFor="empty-message">
						Message
					</Label>
					<div className="absolute top-0 left-2 z-10 pt-2 ">
						<div className="flex items-center gap-2">
							<AtSelectorComponent />
							{chatContext.trim() && (
								<Badge 
									className="h-5 px-2 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer max-w-[200px] group"
									onClick={() => clearChatContext()}
									variant="secondary"
								>
									<X className="h-3 w-3 text-indigo-600 flex-shrink-0" />
									<Sparkles className="h-3 w-3 text-indigo-600 flex-shrink-0" />
									<span className="truncate" title="Template Instructions">Template</span>
								</Badge>
							)}
						</div>
					</div>
					<div className="relative ">
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
					<div className="flex items-center justify-between p-6 pt-0">
						<div className="flex items-center gap-2">
							{loadDocumentPanel()}
							<AgentTypeSelector 
								onAgentTypeChange={setSelectedAgentType}
								selectedAgentType={selectedAgentType}
							/>
							<ModelSelector 
								onModelChange={setSelectedModel}
								selectedModel={selectedModel}
								selectedAgentType={selectedAgentType}
							/>
						</div>
						<Button
							className="gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
							disabled={
								isPending ||
								(!chatInput.trim())
							}
							onClick={handleSubmit}
							size="sm"
							type="submit"
						>
							{isPending ? (
								<>
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								</>
							) : (
								<>
									Send
									<CornerDownLeft className="h-3.5 w-3.5" />
								</>
							)}
						</Button>
					</div>
				</div>
				<div className="mt-6"> {/* Tab System */}
					<div className="flex justify-center mb-6">
						<div className="inline-flex bg-gray-100 rounded-lg p-1">
							{staticTabTypes.map((tab) => {
								const IconComponent = tab.icon;
								const isActive = activeTab === tab.id;
								
								return (
									<button
										className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
											isActive 
												? "bg-white text-indigo-600 shadow-sm" 
												: "text-gray-600 hover:text-gray-900"
										}`}
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
									>
										<IconComponent className="h-4 w-4" />
										{tab.label}
									</button>
								);
							})}
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl  items-stretch">
						{staticChatTypes[activeTab]?.map((type) => {
							const IconComponent = type.icon;
							const isSelected = chatDirectiveType === type.id;
								
							return (
								<div
									className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
										isSelected 
											? "border-indigo-500 bg-indigo-50" 
											: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
									}`}
									key={`${type.id}-${type.templateId || "default"}`}
									onClick={() => {
										if (type.id === "template" && type.templateId) {
											// Find the full template data from the templates array
											const fullTemplate = allTemplates?.find((t) => t.id === type.templateId);
											if (fullTemplate) {
												handleTemplateSelection(fullTemplate);
											}
										} else {
											setChatDirectiveType(type.id);
										}
									}}
								>
									<div className="flex flex-col items-center text-center space-y-3">
										<div className={`p-3 rounded-lg ${
											isSelected ? "bg-indigo-100" : "bg-gray-50"
										}`}
										>
											<IconComponent 
												className={`h-6 w-6 ${
													isSelected ? "text-indigo-600" : "text-gray-600"
												}`} 
											/>
										</div>
										<div>
											<h4 className={`font-semibold text-sm mb-1 ${
												isSelected ? "text-indigo-900" : "text-gray-900"
											}`}
											>
												{type.title}
											</h4>
											<p className="text-xs text-gray-600 leading-relaxed">
												{type.description}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
