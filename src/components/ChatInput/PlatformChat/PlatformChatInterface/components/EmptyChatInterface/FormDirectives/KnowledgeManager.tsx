import React, { useState, useCallback, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2, X, Search, Folder } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface DocumentSectionProps {
	label: string;
	isPending: boolean;
	documents: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
	onRemoveDocument: (docId: string) => void;
	loadDocumentPanel: () => React.ReactNode;
}

const DocumentSection = React.memo(({ 
	label,
	isPending,
	documents,
	onRemoveDocument,
	loadDocumentPanel,
}: DocumentSectionProps) => {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium text-gray-700">
					{label} <span className="text-gray-400">(optional)</span>
				</Label>
				<div className="flex-shrink-0">
					{loadDocumentPanel()}
				</div>
			</div>
			{documents.length > 0 && (
				<div className="space-y-2">
					{documents.map((document) => (
						<div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200" key={document.id}>
							<FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
							<span className="text-sm text-blue-900 truncate flex-1" title={document.name}>
								{document.name}
							</span>
							<Button
								className="h-6 w-6 p-0 hover:bg-blue-200"
								disabled={isPending}
								onClick={() => onRemoveDocument(document.id)}
								size="sm"
								type="button"
								variant="ghost"
							>
								<X className="h-3 w-3 text-blue-600" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
});

DocumentSection.displayName = "DocumentSection";

interface FolderSectionProps {
	label: string;
	isPending: boolean;
	folders: Array<{
		id: string;
		name: string;
	}>;
	onRemoveFolder: (folderId: string) => void;
}

const FolderSection = React.memo(({ 
	label,
	isPending,
	folders,
	onRemoveFolder,
}: FolderSectionProps) => {
	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium text-gray-700">
				{label} <span className="text-gray-400">(optional)</span>
			</Label>
			{folders.length > 0 && (
				<div className="space-y-2">
					{folders.map((folder) => (
						<div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-md border border-green-200" key={folder.id}>
							<Folder className="h-4 w-4 text-green-600 flex-shrink-0" />
							<span className="text-sm text-green-900 truncate flex-1" title={folder.name}>
								{folder.name}
							</span>
							<Button
								className="h-6 w-6 p-0 hover:bg-green-200"
								disabled={isPending}
								onClick={() => onRemoveFolder(folder.id)}
								size="sm"
								type="button"
								variant="ghost"
							>
								<X className="h-3 w-3 text-green-600" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
});

FolderSection.displayName = "FolderSection";

export default function KnowledgeManager({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
	loadDocumentPanel,
}: KnowledgeManagerProps) {
	const { selectedContexts, setSelectedContexts, contextFolder } = useChatStore();
	const { activeChatEntity } = useStore();
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

	// Separate folders from documents (assuming contextFolder represents selected folders)
	const selectedFolders = contextFolder.id ? [{ id: contextFolder.id, name: contextFolder.name }] : [];

	// Use ref to track the last prompt to prevent unnecessary updates
	const lastPromptRef = useRef<string>("");
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

		// Add main search query
		if (searchQuery) {
			prompt += `**Search Query:** ${searchQuery}\n\n`;
		}

		// Add search context
		if (searchContext) {
			prompt += `**Search Context:** ${searchContext}\n\n`;
		}

		// Add specific questions
		if (specificQuestions) {
			prompt += `**Specific Questions to Answer:**\n${specificQuestions}\n\n`;
		}

		// Add selected documents if any
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

		// Add selected folders if any
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

		// Add additional instructions if provided
		if (additionalInstructions) {
			prompt += `\n\n**Additional Instructions:**\n${additionalInstructions}`;
		}

		return prompt;
	}, [formData, selectedDocuments, selectedFolders]);

	// Update chat input with debouncing and change detection
	useEffect(() => {
		if (isFormValid && !isWaitingForResponse) {
			// Clear existing timeout
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}

			// Set new timeout for debouncing
			debounceTimeoutRef.current = setTimeout(() => {
				const newPrompt = generatePrompt();
				
				// Only update if the prompt has actually changed
				if (newPrompt !== lastPromptRef.current) {
					lastPromptRef.current = newPrompt;
					setChatInput(newPrompt);
				}
			}, 300); // 300ms debounce
		}

		// Cleanup timeout on unmount
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [formData, selectedDocuments, selectedFolders, isFormValid, isWaitingForResponse, generatePrompt]);

	const removeDocument = useCallback((docId: string) => {
		const newContexts = selectedDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(currentChatId, newContexts);
	}, [selectedDocuments, setSelectedContexts, currentChatId]);

	const removeFolder = useCallback((folderId: string) => {
		// Remove folder from context using the chat store
		const { setContextFolder } = useChatStore.getState();
		setContextFolder(null, "");
	}, []);

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-[85vh] p-16">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Knowledge Search & Discovery
				</h3>
				<p className="text-sm text-gray-600">
					Search for specific information across your project documents. Provide search parameters and optionally select specific files or folders to focus the search.
				</p>
				{(selectedDocuments.length > 0 || selectedFolders.length > 0) && (
					<p className="text-xs text-blue-600 mt-2">
						{selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} 
						{selectedFolders.length > 0 && ` and ${selectedFolders.length} folder${selectedFolders.length !== 1 ? "s" : ""}`} selected
					</p>
				)}
			</div>
			<div className="space-y-6">
				{/* Main Search Query */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Search Query <span className="text-red-500">*</span>
					</Label>
					<Input
						className="w-full"
						disabled={isPending}
						onChange={(e) => handleInputChange("searchQuery", e.target.value)}
						placeholder="What information are you looking for? (e.g., 'safety protocols', 'budget requirements', 'project timeline')"
						value={formData.searchQuery}
					/>
				</div>
				{/* Search Context */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Search Context <span className="text-gray-400">(optional)</span>
					</Label>
					<Textarea
						className="w-full resize-none"
						disabled={isPending}
						onChange={(e) => handleInputChange("searchContext", e.target.value)}
						placeholder="Provide additional context for your search (e.g., 'for the construction project', 'related to compliance requirements')"
						value={formData.searchContext}
					/>
				</div>
				{/* Specific Questions */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Specific Questions <span className="text-gray-400">(optional)</span>
					</Label>
					<Textarea
						className="w-full resize-none"
						disabled={isPending}
						onChange={(e) => handleInputChange("specificQuestions", e.target.value)}
						placeholder="List specific questions you want answered (one per line)"
						value={formData.specificQuestions}
					/>
				</div>
				{/* Document Selection */}
				<DocumentSection
					documents={selectedDocuments}
					isPending={isPending}
					label="Specific Documents to Search"
					loadDocumentPanel={loadDocumentPanel}
					onRemoveDocument={removeDocument}
				/>
				{/* Folder Selection */}
				<FolderSection
					folders={selectedFolders}
					isPending={isPending}
					label="Specific Folders to Search"
					onRemoveFolder={removeFolder}
				/>
				{/* Output Format */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Output Format <span className="text-gray-400">(optional)</span>
					</Label>
					<Input
						className="w-full"
						disabled={isPending}
						onChange={(e) => handleInputChange("outputFormat", e.target.value)}
						placeholder="How should results be formatted? (e.g., 'bullet points', 'detailed report', 'table format')"
						value={formData.outputFormat}
					/>
				</div>
				{/* Additional Instructions */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Additional Instructions <span className="text-gray-400">(optional)</span>
					</Label>
					<Textarea
						className="w-full resize-none"
						disabled={isPending}
						onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
						placeholder="Any additional instructions for the search agent..."
						value={formData.additionalInstructions}
					/>
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-gray-100">
				<Button
					className="bg-indigo-500 hover:bg-indigo-600 text-white px-6"
					disabled={isWaitingForResponse || !isFormValid}
					onClick={handleFormSubmit}
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
		</ScrollArea>
	);
} 