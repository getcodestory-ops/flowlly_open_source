import React, { useState, useCallback, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	loadDocumentPanel,
}: DocumentGenerationProps): React.JSX.Element {
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
	}, [formData, isFormValid, isWaitingForResponse, generatePrompt, setChatInput]);

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 shadow-sm h-[85vh] p-16">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Document Generation
				</h3>
				<p className="text-sm text-gray-600">
					Create a new document in the sandbox. Specify the document name, type, and optional content instructions.
				</p>
			</div>
			<div className="space-y-6">
				{/* Document Name */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Document Name <span className="text-red-500">*</span>
					</Label>
					<Input
						className="w-full"
						disabled={isPending}
						onChange={(e) => handleInputChange("documentName", e.target.value)}
						placeholder="Enter document name (without extension)"
						value={formData.documentName}
					/>
					<p className="text-xs text-gray-500">
						Enter the name without extension (e.g., "my-document" not "my-document.txt")
					</p>
				</div>

				{/* Document Type */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Document Type <span className="text-red-500">*</span>
					</Label>
					<Select
						disabled={isPending}
						onValueChange={(value) => handleInputChange("documentType", value)}
						value={formData.documentType}
					>
						<SelectTrigger className="w-full">
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
					<p className="text-xs text-gray-500">
						Select the file type/extension for your document
					</p>
				</div>

				{/* Content Instructions */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Content Instructions <span className="text-gray-400">(optional)</span>
					</Label>
					<Textarea
						className="w-full resize-none min-h-[200px]"
						disabled={isPending}
						onChange={(e) => handleInputChange("contentInstructions", e.target.value)}
						placeholder="Describe what content should be in the document. Be specific about structure, sections, data, or any requirements. Leave empty for a basic template."
						value={formData.contentInstructions}
					/>
					<p className="text-xs text-gray-500">
						Provide detailed instructions for what the document should contain. The AI will generate content based on these instructions.
					</p>
				</div>

				{/* Preview of filename */}
				{formData.documentName && (
					<div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<Label className="text-sm font-medium text-blue-900">
							Document Preview
						</Label>
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-blue-600" />
							<span className="text-sm font-mono text-blue-900">
								{formData.documentName}.{formData.documentType}
							</span>
						</div>
					</div>
				)}

				{/* Action Button */}
				<Button
					className="w-full gap-2 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
					disabled={isPending || !isFormValid}
					onClick={handleSubmit}
					size="lg"
					type="button"
				>
					{isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Generating Document...
						</>
					) : (
						<>
							<FileText className="h-4 w-4" />
							Generate Document
							<CornerDownLeft className="h-4 w-4" />
						</>
					)}
				</Button>
			</div>
		</ScrollArea>
	);
}
