import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2, Calendar } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore, useViewStore } from "@/utils/store";
import { DocTextArea, DocInput, DocRefButton, InlineDocRef } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

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

export default function ReportWriting({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
}: ReportWritingProps) {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed } = useChatStore();
	const { activeChatEntity } = useStore();
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [formData, setFormData] = useState<ReportWritingFormData>({
		date: new Date().toISOString().split("T")[0],
		reportName: "",
		hasExistingTemplate: false,
		additionalNotes: "",
		specialInstructions: "",
		documentInstructions: {},
	});

	// Document panel opener
	const openDocumentPanel = useCallback(() => {
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: currentChatId,
			contextId: currentChatId,
			title: "Select Documents for Report",
		});
	}, [setCollapsed, setSidePanel, currentChatId]);

	// Categorize selected documents
	const { templates, referenceReports, relevantData } = useMemo(() => {
		const templates: typeof selectedDocuments = [];
		const referenceReports: typeof selectedDocuments = [];
		const relevantData: typeof selectedDocuments = [];

		selectedDocuments.forEach((doc) => {
			const extension = doc.extension?.toLowerCase() || "";
			
			if (formData.hasExistingTemplate) {
				if (["template", "html", "htm", "pdf", "doc", "docx", "txt", "md", "rtf", "odt"].includes(extension) || 
					doc.name.toLowerCase().includes("template") ||
					doc.name.toLowerCase().includes("format")) {
					templates.push(doc);
				} else {
					relevantData.push(doc);
				}
			} else {
				if (extension || doc.name.toLowerCase().includes("report") || doc.name.toLowerCase().includes("example")) {
					referenceReports.push(doc);
				} else {
					relevantData.push(doc);
				}
			}
		});

		return { templates, referenceReports, relevantData };
	}, [selectedDocuments, formData.hasExistingTemplate]);

	const getPrompt = useCallback(() => {
		let prompt = `Generate a comprehensive report titled "${formData.reportName}" for ${formData.date}.\n\n`;
		
		prompt += ":::instructions\nPlease use the following workflow to generate the report:\n\n";
		
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

		if (formData.additionalNotes.trim()) {
			prompt += "**Additional Context and Notes:**\n";
			prompt += `${formData.additionalNotes.trim()}\n\n`;
		}

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

	// Validation
	const isFormValid = formData.reportName.trim() && selectedDocuments.length > 0;

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Update chat input in real time
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

	const totalSelectedDocuments = selectedDocuments.length;

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
				{/* Document Title */}
				<h1 className="text-3xl font-normal text-gray-900 mb-4">
					Report Writing Assistant
				</h1>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					Generate professional reports using templates, reference documents, and data sources. 
					Provide a report name and select relevant materials to get started.
				</p>

				{/* Date and Report Name */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<div>
						<h2 className="text-base font-semibold italic text-gray-900 mb-4 flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Report Date
						</h2>
						<DocInput
							value={formData.date}
							onChange={(value) => handleInputChange("date", value)}
							type="date"
							disabled={isPending}
						/>
					</div>
					<div>
						<h2 className="text-base font-semibold italic text-gray-900 mb-4 flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Report Name
						</h2>
						<DocInput
							value={formData.reportName}
							onChange={(value) => handleInputChange("reportName", value)}
							placeholder="Enter the name of your report"
							disabled={isPending}
						/>
					</div>
				</div>

				{/* Template Question */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Do you have an existing report template?
					</h2>
					<div className="flex gap-6">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								checked={formData.hasExistingTemplate === true}
								onChange={() => setFormData((prev) => ({ ...prev, hasExistingTemplate: true }))}
								disabled={isPending}
								className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
							/>
							<span className="text-sm text-gray-700">Yes, I have a template</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								checked={formData.hasExistingTemplate === false}
								onChange={() => setFormData((prev) => ({ ...prev, hasExistingTemplate: false }))}
								disabled={isPending}
								className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
							/>
							<span className="text-sm text-gray-700">No, use reference reports</span>
						</label>
					</div>
				</div>

				{/* Document Selection */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						{formData.hasExistingTemplate ? "Select Your Report Template" : "Select Reference Reports"}
					</h2>
					<div className="flex items-start gap-2">
						<DocRefButton
							onClick={openDocumentPanel}
							hasDocuments={selectedDocuments.length > 0}
							disabled={isPending}
							label={formData.hasExistingTemplate ? "Select template & data" : "Select reports & data"}
							colorTheme="rose"
						/>
					</div>
					<InlineDocRef
						documents={formData.hasExistingTemplate ? templates : referenceReports}
						onRemove={removeDocument}
						disabled={isPending}
						showInstructions={!formData.hasExistingTemplate}
						instructions={formData.documentInstructions}
						onInstructionChange={handleDocumentInstructionChange}
						instructionPlaceholder="What specific structure, format, or content elements should be referenced from this document?"
						colorTheme="rose"
						layout="stacked"
					/>
				</div>

				{/* Relevant Data */}
				{relevantData.length > 0 && (
					<div className="mb-8">
						<h2 className="text-base font-semibold italic text-gray-900 mb-4">
							Relevant Files & Data
						</h2>
						<InlineDocRef
							documents={relevantData}
							onRemove={removeDocument}
							disabled={isPending}
							showInstructions
							instructions={formData.documentInstructions}
							onInstructionChange={handleDocumentInstructionChange}
							instructionPlaceholder="How should this data be used in the report?"
							colorTheme="rose"
							layout="stacked"
						/>
					</div>
				)}

				{/* Additional Notes */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Additional Notes
					</h2>
					<DocTextArea
						value={formData.additionalNotes}
						onChange={(value) => handleInputChange("additionalNotes", value)}
						placeholder="Any additional context, background information, or specific requirements for the report..."
						disabled={isPending}
					/>
				</div>

				{/* Special Instructions */}
				<div className="mb-12">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Special Instructions for Final Report
					</h2>
					<DocTextArea
						value={formData.specialInstructions}
						onChange={(value) => handleInputChange("specialInstructions", value)}
						placeholder="Specific formatting requirements, style preferences, target audience considerations..."
						disabled={isPending}
					/>
				</div>

				{/* Validation message */}
				{!isFormValid && formData.reportName && (
					<div className="mb-8 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-700">
						⚠️ Please provide a report name and select at least one document.
					</div>
				)}

				{/* Status and submit */}
				<div className="pt-6 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							{totalSelectedDocuments > 0 && (
								<span>{totalSelectedDocuments} document{totalSelectedDocuments !== 1 ? "s" : ""} attached</span>
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
								className="bg-rose-600 hover:bg-rose-700 text-white px-6"
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
					</div>
				</div>
			</div>
		</div>
	);
}
