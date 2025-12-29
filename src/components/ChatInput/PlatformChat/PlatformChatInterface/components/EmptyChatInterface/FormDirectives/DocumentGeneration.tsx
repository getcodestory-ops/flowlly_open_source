import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useViewStore } from "@/utils/store";
import { DocTextArea, DocInput } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

interface DocumentGenerationProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface DocumentGenerationFormData {
	documentName: string;
	documentType: string;
	contentInstructions: string;
}

// Common document types with extensions
const DOCUMENT_TYPES = [
	{ value: "md", label: "Markdown (.md)" },
	{ value: "docx", label: "Word Document (.docx)" },
	{ value: "xlsx", label: "Excel Document (.xlsx)" },
	{ value: "pptx", label: "PowerPoint Document (.pptx)" },
];

export default function DocumentGeneration({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
}: DocumentGenerationProps): React.JSX.Element {
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();
	const [formData, setFormData] = useState<DocumentGenerationFormData>({
		documentName: "",
		documentType: "md",
		contentInstructions: "",
	});

	// Track the last prompt to avoid unnecessary updates
	const lastPromptRef = useRef<string>("");
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Check if form is valid (only document name is required)
	const isFormValid = formData.documentName.trim().length > 0;

	const handleInputChange = useCallback((field: keyof DocumentGenerationFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Generate the prompt for the AI
	const generatePrompt = useCallback(() => {
		const { documentName, documentType, contentInstructions } = formData;

		let prompt = `# Document Generation Request\n\n`;
		prompt += `**Document Name:** ${documentName}\n`;
		prompt += `**Document Type:** ${documentType}\n\n`;

		if (contentInstructions) {
			prompt += `**Content Instructions:**\n${contentInstructions}\n\n`;
		}

		prompt += `**Instructions for the agent:**
:::instructions
1. Create a new document with the name "${documentName}.${documentType}" in the sandbox.
2. The document should be of type: ${documentType}.${contentInstructions ? `
3. Generate content based on the following instructions: ${contentInstructions}` : `
4. Create an appropriate template or starter content for a ${documentType} file.`}
:::`;

		return prompt;
	}, [formData]);

	// Update chat input with debouncing and change detection
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
	}, [formData, isFormValid, isWaitingForResponse, generatePrompt, setChatInput]);

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
				{/* Document Title */}
				<h1 className="text-3xl font-normal text-gray-900 mb-4">
					Document Generation
				</h1>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					Create a new document in the sandbox. Specify the document name, type, and optional content instructions.
				</p>

				{/* Document Name */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Document Name
					</h2>
					<DocInput
						value={formData.documentName}
						onChange={(value) => handleInputChange("documentName", value)}
						placeholder="Enter document name (without extension)"
						disabled={isPending}
					/>
					<p className="text-xs text-gray-400 mt-2">
						Enter the name without extension (e.g., "my-document" not "my-document.txt")
					</p>
				</div>

				{/* Document Type */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Document Type
					</h2>
					<Select
						disabled={isPending}
						onValueChange={(value) => handleInputChange("documentType", value)}
						value={formData.documentType}
					>
						<SelectTrigger className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 shadow-none px-0">
							<SelectValue placeholder="Select document type" />
						</SelectTrigger>
						<SelectContent>
							{DOCUMENT_TYPES.map((type) => (
								<SelectItem key={type.value} value={type.value}>
									{type.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-gray-400 mt-2">
						Select the file type/extension for your document
					</p>
				</div>

				{/* Content Instructions */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Content Instructions
					</h2>
				<DocTextArea
					value={formData.contentInstructions}
					onChange={(value) => handleInputChange("contentInstructions", value)}
					placeholder="Describe what content should be in the document. Be specific about structure, sections, data, or any requirements. Leave empty for a basic template."
					disabled={isPending}
					minHeight={100}
					rows={4}
				/>
					<p className="text-xs text-gray-400 mt-2">
						Provide detailed instructions for what the document should contain.
					</p>
				</div>

				{/* Preview */}
				{formData.documentName && (
					<div className="mb-12 p-4 bg-violet-50 border border-violet-200 rounded">
						<h3 className="text-sm font-medium text-violet-900 mb-2">Document Preview</h3>
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-violet-600" />
							<span className="text-sm font-mono text-violet-900">
								{formData.documentName}.{formData.documentType}
							</span>
						</div>
					</div>
				)}

				{/* Status and submit */}
				<div className="pt-6 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							{formData.documentName && (
								<span>Ready to create {formData.documentName}.{formData.documentType}</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							<ModelSelector 
								selectedModel={preferredModel}
								onModelChange={setPreferredModel}
								selectedAgentType={preferredAgentType}
							/>
							<Button
								onClick={handleSubmit}
								disabled={isPending || !isFormValid}
								className="bg-violet-600 hover:bg-violet-700 text-white px-6"
							>
								{isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Generating Document...
									</>
								) : (
									<>
										<FileText className="h-4 w-4 mr-2" />
										Generate Document
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
