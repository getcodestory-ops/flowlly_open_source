import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, Search, Folder, X } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore, useViewStore } from "@/utils/store";
import { DocTextArea, DocInput, DocRefButton, InlineDocRef } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

interface KnowledgeManagerProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface KnowledgeManagerFormData {
	searchQuery: string;
	searchContext: string;
	specificQuestions: string;
	outputFormat: string;
	additionalInstructions: string;
	selectedDocuments: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
	selectedFolders: Array<{
		id: string;
		name: string;
	}>;
}

export default function KnowledgeManager({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
}: KnowledgeManagerProps) {
	const { selectedContexts, setSelectedContexts, contextFolder, setSidePanel, setCollapsed, setContextFolder } = useChatStore();
	const { activeChatEntity } = useStore();
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [formData, setFormData] = useState<KnowledgeManagerFormData>({
		searchQuery: "",
		searchContext: "",
		specificQuestions: "",
		outputFormat: "",
		additionalInstructions: "",
		selectedDocuments: [],
		selectedFolders: [],
	});

	// Separate folders from documents
	const selectedFolders = contextFolder.id ? [{ id: contextFolder.id, name: contextFolder.name }] : [];

	// Use ref to track the last prompt
	const lastPromptRef = useRef<string>("");
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Document panel opener
	const openDocumentPanel = useCallback(() => {
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: currentChatId,
			contextId: currentChatId,
			title: "Select Documents to Search",
		});
	}, [setCollapsed, setSidePanel, currentChatId]);

	const handleInputChange = useCallback((field: keyof KnowledgeManagerFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Check if form is valid (search query is required)
	const isFormValid = formData.searchQuery.trim().length > 0;

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Generate prompt function
	const generatePrompt = useCallback(() => {
		const searchQuery = formData.searchQuery.trim();
		const searchContext = formData.searchContext.trim();
		const specificQuestions = formData.specificQuestions.trim();
		const outputFormat = formData.outputFormat.trim();
		const additionalInstructions = formData.additionalInstructions.trim();

		let prompt = "Use the search agent to find the following information from the project documents:\n\n";

		if (searchQuery) {
			prompt += `**Search Query:** ${searchQuery}\n\n`;
		}

		if (searchContext) {
			prompt += `**Search Context:** ${searchContext}\n\n`;
		}

		if (specificQuestions) {
			prompt += `**Specific Questions to Answer:**\n${specificQuestions}\n\n`;
		}

		if (selectedDocuments.length > 0) {
			prompt += "**Focus on these specific documents:**\n";
			selectedDocuments.forEach((doc) => {
				const attachment = {
					uuid: doc.id,
					name: doc.name,
					specialInstructions: "Include this document in the search scope",
				};
				prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		if (selectedFolders.length > 0) {
			prompt += "**Focus search within these folders:**\n";
			selectedFolders.forEach((folder) => {
				prompt += `- ${folder.name}\n`;
			});
			prompt += "\n";
		}

		prompt += `**Instructions for the search agent:**
:::instructions
1. Conduct a comprehensive search across the project documents${selectedDocuments.length > 0 || selectedFolders.length > 0 ? " focusing on the specified files and folders" : ""}.
2. Look for information related to: "${searchQuery}"${searchContext ? ` in the context of: "${searchContext}"` : ""}.
3. Extract relevant information, quotes, and references.
4. Organize findings in a structured format.
5. Provide source references for all information found.${specificQuestions ? `
6. Make sure to address these specific questions: ${specificQuestions}` : ""}${outputFormat ? `
7. Format the results as follows: ${outputFormat}` : `
7. Present results in a clear, organized manner with headings and bullet points.`}
8. If no relevant information is found, clearly state this and suggest alternative search terms.
9. Highlight the most important and relevant findings at the top.
:::`;

		if (additionalInstructions) {
			prompt += `\n\n**Additional Instructions:**\n${additionalInstructions}`;
		}

		return prompt;
	}, [formData, selectedDocuments, selectedFolders]);

	// Update chat input with debouncing
	useEffect(() => {
		if (isFormValid && !isWaitingForResponse) {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}

			debounceTimeoutRef.current = setTimeout(() => {
				const newPrompt = generatePrompt();
				
				if (newPrompt !== lastPromptRef.current) {
					lastPromptRef.current = newPrompt;
					setChatInput(newPrompt);
				}
			}, 300);
		}

		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [formData, selectedDocuments, selectedFolders, isFormValid, isWaitingForResponse, generatePrompt, setChatInput]);

	const removeDocument = useCallback((docId: string) => {
		const newContexts = selectedDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(currentChatId, newContexts);
	}, [selectedDocuments, setSelectedContexts, currentChatId]);

	const removeFolder = useCallback(() => {
		setContextFolder(null, "");
	}, [setContextFolder]);

	const totalSelectedItems = selectedDocuments.length + selectedFolders.length;

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
				{/* Document Title */}
				<h1 className="text-3xl font-normal text-gray-900 mb-4">
					Knowledge Search & Discovery
				</h1>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					Search for specific information across your project documents. Provide search parameters 
					and optionally select specific files or folders to focus the search.
				</p>

				{/* Main Search Query */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Search Query
					</h2>
					<DocInput
						value={formData.searchQuery}
						onChange={(value) => handleInputChange("searchQuery", value)}
						placeholder="What information are you looking for? (e.g., 'safety protocols', 'budget requirements', 'project timeline')"
						disabled={isPending}
					/>
				</div>

				{/* Search Context */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Search Context
					</h2>
					<DocTextArea
						value={formData.searchContext}
						onChange={(value) => handleInputChange("searchContext", value)}
						placeholder="Provide additional context for your search (e.g., 'for the construction project', 'related to compliance requirements')"
						disabled={isPending}
					/>
				</div>

				{/* Specific Questions */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Specific Questions
					</h2>
					<DocTextArea
						value={formData.specificQuestions}
						onChange={(value) => handleInputChange("specificQuestions", value)}
						placeholder="List specific questions you want answered (one per line)"
						disabled={isPending}
					/>
				</div>

				{/* Document Selection */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Specific Documents to Search
					</h2>
					<div className="flex items-start gap-2 mb-2">
					<DocRefButton
						onClick={openDocumentPanel}
						hasDocuments={selectedDocuments.length > 0}
						disabled={isPending}
						label="Select documents"
						colorTheme="blue"
					/>
					<InlineDocRef
						documents={selectedDocuments}
						onRemove={removeDocument}
						disabled={isPending}
						colorTheme="blue"
					/>
					</div>
				</div>

				{/* Folder Selection */}
				{selectedFolders.length > 0 && (
					<div className="mb-8">
						<h2 className="text-base font-semibold italic text-gray-900 mb-4">
							Selected Folders
						</h2>
						<div className="flex items-start gap-2">
							{selectedFolders.map((folder) => (
								<span key={folder.id} className="inline-flex items-center gap-1 text-blue-600">
									<Folder className="h-3.5 w-3.5 inline" />
									<span className="text-sm">{folder.name}</span>
									{!isPending && (
										<button
											onClick={() => removeFolder()}
											className="hover:text-red-500 transition-colors"
										>
											<X className="h-3 w-3" />
										</button>
									)}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Output Format */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Output Format
					</h2>
					<DocInput
						value={formData.outputFormat}
						onChange={(value) => handleInputChange("outputFormat", value)}
						placeholder="How should results be formatted? (e.g., 'bullet points', 'detailed report', 'table format')"
						disabled={isPending}
					/>
				</div>

				{/* Additional Instructions */}
				<div className="mb-12">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Additional Instructions
					</h2>
					<DocTextArea
						value={formData.additionalInstructions}
						onChange={(value) => handleInputChange("additionalInstructions", value)}
						placeholder="Any additional instructions for the search agent..."
						disabled={isPending}
					/>
				</div>

				{/* Status and submit */}
				<div className="pt-6 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							{totalSelectedItems > 0 && (
								<span>{totalSelectedItems} item{totalSelectedItems !== 1 ? "s" : ""} selected for search</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							<ModelSelector 
								selectedModel={preferredModel}
								onModelChange={setPreferredModel}
								selectedAgentType={preferredAgentType}
							/>
							<Button
								onClick={handleFormSubmit}
								disabled={isWaitingForResponse || !isFormValid}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6"
							>
								{isWaitingForResponse ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Searching...
									</>
								) : (
									<>
										<Search className="h-4 w-4 mr-2" />
										Search Knowledge
										<CornerDownLeft className="h-4 w-4 ml-2" />
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
