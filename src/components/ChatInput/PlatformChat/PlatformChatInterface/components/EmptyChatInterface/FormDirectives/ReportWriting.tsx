import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2, X, Calendar, FileCode, FileImage, Folder, StickyNote } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportWritingProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface ReportWritingFormData {
	date: string;
	reportName: string;
	hasExistingTemplate: boolean;
	additionalNotes: string;
	specialInstructions: string;
	documentInstructions: { [documentId: string]: string };
}

interface DocumentWithInstructionProps {
	label: string;
	icon: React.ReactNode;
	documents: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
	isPending: boolean;
	onRemoveDocument: (docId: string) => void;
	loadDocumentPanel: () => React.ReactNode;
	isMultiple?: boolean;
	isRequired?: boolean;
	showInstructions?: boolean;
	documentInstructions: { [documentId: string]: string };
	onInstructionChange: (documentId: string, instruction: string) => void;
	instructionPlaceholder?: string;
}

const DocumentWithInstructionSection = React.memo(({ 
	label,
	icon,
	documents,
	isPending,
	onRemoveDocument,
	loadDocumentPanel,
	isMultiple = false,
	isRequired = false,
	showInstructions = false,
	documentInstructions,
	onInstructionChange,
	instructionPlaceholder,
}: DocumentWithInstructionProps) => {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				{icon}
				<Label className="text-sm font-medium text-gray-700">
					{label} {isRequired && <span className="text-red-500">*</span>} {!isRequired && !isMultiple && <span className="text-gray-400">(optional)</span>}
				</Label>
			</div>
			<div className="flex gap-3 items-start">
				<div className="flex-shrink-0">
					{loadDocumentPanel()}
				</div>
				<div className="flex-1 space-y-2">
					{documents.length > 0 ? (
						documents.map((document) => (
							<div className="space-y-2" key={document.id}>
								<div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
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
								{showInstructions && (
									<Textarea
										className="min-h-16 text-sm"
										disabled={isPending}
										onChange={(e) => onInstructionChange(document.id, e.target.value)}
										placeholder={instructionPlaceholder || `Special instructions for ${document.name}...`}
										value={documentInstructions[document.id] || ""}
									/>
								)}
							</div>
						))
					) : (
						<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">
							{isRequired ? `Please select ${label.toLowerCase()}` : `Click the attachment icon to select ${label.toLowerCase()}`}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

DocumentWithInstructionSection.displayName = "DocumentWithInstructionSection";

export default function ReportWriting({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
	loadDocumentPanel,
}: ReportWritingProps) {
	const { selectedContexts, setSelectedContexts } = useChatStore();
	const { activeChatEntity } = useStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [formData, setFormData] = useState<ReportWritingFormData>({
		date: new Date().toISOString()
			.split("T")[0], // Default to today
		reportName: "",
		hasExistingTemplate: false,
		additionalNotes: "",
		specialInstructions: "",
		documentInstructions: {},
	});

	// Categorize selected documents
	const { templates, referenceReports, relevantData } = useMemo(() => {
		const templates: typeof selectedDocuments = [];
		const referenceReports: typeof selectedDocuments = [];
		const relevantData: typeof selectedDocuments = [];

		selectedDocuments.forEach((doc) => {
			// Get file extension, handle cases where it might be undefined
			const extension = doc.extension?.toLowerCase() || "";
			
			if (formData.hasExistingTemplate) {
				// When user has existing template, these files are templates
				// Templates should be document formats that can define structure/layout
				if (["template", "html", "htm", "pdf", "doc", "docx", "txt", "md", "rtf", "odt"].includes(extension) || 
					doc.name.toLowerCase().includes("template") ||
					doc.name.toLowerCase().includes("format")) {
					templates.push(doc);
				} else {
					relevantData.push(doc);
				}
			} else {
				// When user doesn't have template, reference reports can be ANY document type
				// This includes Excel, CSV, images, PDFs, Word docs, presentations, etc.
				// Only exclude folders (which typically don't have extensions)
				if (extension || doc.name.toLowerCase().includes("report") || doc.name.toLowerCase().includes("example")) {
					referenceReports.push(doc);
				} else {
					// If no extension, it's likely a folder - put in relevant data
					relevantData.push(doc);
				}
			}
		});

		return { templates, referenceReports, relevantData };
	}, [selectedDocuments, formData.hasExistingTemplate]);

	const getPrompt = useCallback(() => {
		let prompt = `Generate a comprehensive report titled "${formData.reportName}" for ${formData.date}.\n\n`;
		
		prompt += ":::instructions\nPlease use the following workflow to generate the report:\n\n";
		
		// Add template attachments if user has existing template
		if (formData.hasExistingTemplate && templates.length > 0) {
			prompt += "**Step 1: Report Template Analysis**\n";
			prompt += "Analyze the provided report template(s) to understand the structure, format, and style requirements.\n\n";
			
			templates.forEach((template) => {
				const customInstructions = formData.documentInstructions[template.id] || "Analyze this template for structure, formatting, sections, and style. Use this as the primary template for the final report.";
				const attachment = {
					uuid: template.id,
					name: template.name,
					specialInstructions: customInstructions,
				};
				prompt += `**Template:** ${template.name}\n`;
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
			prompt += "\n";
		}

		// Add reference reports if user doesn't have existing template
		if (!formData.hasExistingTemplate && referenceReports.length > 0) {
			prompt += "**Step 1: Reference Report Analysis**\n";
			prompt += "Analyze the provided reference report(s) to understand formatting, structure, and content organization patterns. Since no template is available, use these reports as the basis for creating the new report structure.\n\n";
			
			referenceReports.forEach((report) => {
				const customInstructions = formData.documentInstructions[report.id] || "Analyze this reference report for structure and format. Use this as the basis for creating the new report structure.";
				const attachment = {
					uuid: report.id,
					name: report.name,
					specialInstructions: customInstructions,
				};
				prompt += `**Reference Report:** ${report.name}\n`;
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
			prompt += "\n";
		}

		// Add relevant data attachments
		if (relevantData.length > 0) {
			let stepNumber = 1;
			if ((formData.hasExistingTemplate && templates.length > 0) || (!formData.hasExistingTemplate && referenceReports.length > 0)) {
				stepNumber++;
			}
			
			prompt += `**Step ${stepNumber}: Data Analysis**\n`;
			prompt += "Process and analyze the provided data to extract relevant information for inclusion in the report.\n\n";
			
			relevantData.forEach((data) => {
				const customInstructions = formData.documentInstructions[data.id] || "Analyze this data and extract key information, metrics, findings, or insights that should be included in the report.";
				const attachment = {
					uuid: data.id,
					name: data.name,
					specialInstructions: customInstructions,
				};
				prompt += `**Data:** ${data.name}\n`;
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
			prompt += "\n";
		}

		// Add additional notes if provided
		if (formData.additionalNotes.trim()) {
			prompt += "**Additional Context and Notes:**\n";
			prompt += `${formData.additionalNotes.trim()}\n\n`;
		}

		// Report generation instructions
		prompt += "**Report Generation Process:**\n\n";
		if (formData.hasExistingTemplate) {
			prompt += "1. **Template Structure**: Follow the provided template structure exactly\n";
			prompt += "2. **Data Integration**: Systematically incorporate data from all provided sources into the template format\n";
			prompt += "3. **Content Development**: Write clear, professional content for each template section\n";
			prompt += "4. **Template Compliance**: Ensure all content follows the template's formatting and style\n";
			prompt += "5. **Final Review**: Verify all template requirements are met\n\n";
		} else {
			prompt += "1. **Structure Planning**: Create a comprehensive outline based on the reference report structure\n";
			prompt += "2. **Data Integration**: Systematically incorporate data from all provided sources\n";
			prompt += "3. **Content Development**: Write clear, professional content for each section\n";
			prompt += "4. **Quality Assurance**: Ensure consistency, accuracy, and professional presentation\n";
			prompt += "5. **Final Formatting**: Apply proper formatting, headings, and visual elements\n\n";
		}

		prompt += "**Final Report Requirements:**\n\n";
		prompt += `- **Report Title**: ${formData.reportName}\n`;
		prompt += `- **Report Date**: ${formData.date}\n`;
		prompt += "- **Format**: Professional, well-structured document\n";
		prompt += "- **Content**: Comprehensive coverage of all provided data\n";
		if (formData.hasExistingTemplate) {
			prompt += "- **Style**: Must follow the provided template exactly\n";
			prompt += "- **Structure**: Use the template structure without modification\n";
		} else {
			prompt += "- **Style**: Consistent with reference report formatting\n";
			prompt += "- **Structure**: Based on reference report patterns\n";
		}
		prompt += "- **Output**: Final report should be complete and ready for distribution\n\n";

		// Add special instructions if provided
		if (formData.specialInstructions.trim()) {
			prompt += "**Special Instructions for Final Report:**\n";
			prompt += `${formData.specialInstructions.trim()}\n\n`;
		}

		prompt += `Please generate the complete report "${formData.reportName}" following these detailed instructions and incorporating all provided materials.\n:::`;

		return prompt;
	}, [formData, templates, referenceReports, relevantData]);

	const handleInputChange = useCallback((field: keyof ReportWritingFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	const handleDocumentInstructionChange = useCallback((documentId: string, instruction: string) => {
		setFormData((prev) => ({
			...prev,
			documentInstructions: {
				...prev.documentInstructions,
				[documentId]: instruction,
			},
		}));
	}, []);

	// Validation: Report name required, and at least one document selected
	const isFormValid = formData.reportName.trim() && selectedDocuments.length > 0;

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Update chat input in real time whenever form data or selected documents change
	useEffect(() => {
		if (isFormValid && !isWaitingForResponse) {
			const prompt = getPrompt();
			setChatInput(prompt);
		}
	}, [formData, selectedDocuments, templates, referenceReports, relevantData, isFormValid, isWaitingForResponse, getPrompt, setChatInput]);

	const removeDocument = useCallback((docId: string) => {
		const newContexts = selectedDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(currentChatId, newContexts);
	}, [selectedDocuments, setSelectedContexts, currentChatId]);

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-[85vh] p-16">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Report Writing Assistant
				</h3>
				<p className="text-sm text-gray-600">
					Generate professional reports using templates, reference documents, and data sources. Provide a report name and select relevant materials to get started.
				</p>
				{selectedDocuments.length > 0 && (
					<p className="text-xs text-blue-600 mt-2">
						{selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected
					</p>
				)}
			</div>
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-gray-600" />
							<Label className="text-sm font-medium text-gray-700">
								Report Date <span className="text-red-500">*</span>
							</Label>
						</div>
						<Input
							className="w-full"
							disabled={isPending}
							onChange={(e) => handleInputChange("date", e.target.value)}
							required
							type="date"
							value={formData.date}
						/>
					</div>
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-gray-600" />
							<Label className="text-sm font-medium text-gray-700">
								Report Name <span className="text-red-500">*</span>
							</Label>
						</div>
						<Input
							className="w-full"
							disabled={isPending}
							onChange={(e) => handleInputChange("reportName", e.target.value)}
							placeholder="Enter the name of your report"
							required
							type="text"
							value={formData.reportName}
						/>
					</div>
				</div>
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Do you have an existing report template that you created before? <span className="text-red-500">*</span>
					</Label>
					<div className="flex gap-4">
						<div className="flex items-center space-x-2">
							<input
								checked={formData.hasExistingTemplate === true}
								className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
								disabled={isPending}
								id="hasTemplate"
								name="hasExistingTemplate"
								onChange={() => setFormData((prev) => ({ ...prev, hasExistingTemplate: true }))}
								type="radio"
							/>
							<Label className="text-sm text-gray-700" htmlFor="hasTemplate">
								Yes, I have an existing template
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<input
								checked={formData.hasExistingTemplate === false}
								className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
								disabled={isPending}
								id="noTemplate"
								name="hasExistingTemplate"
								onChange={() => setFormData((prev) => ({ ...prev, hasExistingTemplate: false }))}
								type="radio"
							/>
							<Label className="text-sm text-gray-700" htmlFor="noTemplate">
								No, I need to reference existing reports
							</Label>
						</div>
					</div>
				</div>
				{formData.hasExistingTemplate ? (
					<DocumentWithInstructionSection
						documentInstructions={formData.documentInstructions}
						documents={templates}
						icon={<FileCode className="h-4 w-4 text-gray-600" />}
						isMultiple
						isPending={isPending}
						isRequired
						label="Select Your Report Template"
						loadDocumentPanel={loadDocumentPanel}
						onInstructionChange={handleDocumentInstructionChange}
						onRemoveDocument={removeDocument}
						showInstructions={false}
					/>
				) : (
					<DocumentWithInstructionSection
						documentInstructions={formData.documentInstructions}
						documents={referenceReports}
						icon={<FileText className="h-4 w-4 text-gray-600" />}
						instructionPlaceholder="What specific structure, format, or content elements should be referenced from this document?"
						isMultiple
						isPending={isPending}
						isRequired
						label="Select Reference Reports"
						loadDocumentPanel={loadDocumentPanel}
						onInstructionChange={handleDocumentInstructionChange}
						onRemoveDocument={removeDocument}
						showInstructions
					/>
				)}
				{/* Relevant Files and Folders */}
				<DocumentWithInstructionSection
					documentInstructions={formData.documentInstructions}
					documents={relevantData}
					icon={<Folder className="h-4 w-4 text-gray-600" />}
					instructionPlaceholder="How should this data be used in the report? What specific information should be extracted?"
					isMultiple
					isPending={isPending}
					label="Select Relevant Files or Folders"
					loadDocumentPanel={loadDocumentPanel}
					onInstructionChange={handleDocumentInstructionChange}
					onRemoveDocument={removeDocument}
					showInstructions
				/>
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<StickyNote className="h-4 w-4 text-gray-600" />
						<Label className="text-sm font-medium text-gray-700">
							Additional Notes
						</Label>
					</div>
					<Textarea
						className="min-h-20"
						disabled={isPending}
						onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
						placeholder="Any additional context, background information, or specific requirements for the report..."
						value={formData.additionalNotes}
					/>
				</div>
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Special Instructions for Final Report
					</Label>
					<Textarea
						className="min-h-20"
						disabled={isPending}
						onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
						placeholder="Specific formatting requirements, style preferences, target audience considerations, or other special instructions..."
						value={formData.specialInstructions}
					/>
				</div>
				{!isFormValid && formData.reportName && (
					<div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
						⚠️ Please provide a report name and select at least one document (template, reference report, or relevant data).
					</div>
				)}
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
							Generating Report...
						</>
					) : (
						<>
							Generate Report
							<CornerDownLeft className="h-4 w-4 ml-2" />
						</>
					)}
				</Button>
			</div>
		</ScrollArea>
	);
} 