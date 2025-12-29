import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, Calendar, MapPin } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore, useViewStore } from "@/utils/store";
import { DocInput, DocRefButton, InlineDocRef } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

interface DailyReportProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface DailyReportFormData {
	date: string;
	location: string;
	employerName: string;
	projectName: string;
	shiftEngineer: string;
	selectedFolder?: {
		id: string;
		name: string;
		extension: string;
	};
	selectedNotes: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
	selectedImages: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
}

export default function DailyReport({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
}: DailyReportProps) {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed } = useChatStore();
	const { activeChatEntity } = useStore();
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [formData, setFormData] = useState<DailyReportFormData>({
		date: new Date().toISOString().split("T")[0],
		location: "Your Project Location",
		employerName: "Your Company Name",
		projectName: "Your Project Name",
		shiftEngineer: "Your Name",
		selectedFolder: undefined,
		selectedNotes: [],
		selectedImages: [],
	});

	// Document panel opener
	const openDocumentPanel = useCallback(() => {
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: currentChatId,
			contextId: currentChatId,
			title: "Select Files for Daily Report",
		});
	}, [setCollapsed, setSidePanel, currentChatId]);

	// Categorize selected documents
	const { folders, notes, images } = useMemo(() => {
		const folders: typeof selectedDocuments = [];
		const notes: typeof selectedDocuments = [];
		const images: typeof selectedDocuments = [];

		selectedDocuments.forEach((doc) => {
			if (doc.extension && ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(doc.extension.toLowerCase())) {
				images.push(doc);
			} else if (doc.extension && ["txt", "md", "doc", "docx", "pdf"].includes(doc.extension.toLowerCase())) {
				notes.push(doc);
			} else {
				folders.push(doc);
			}
		});

		return { folders, notes, images };
	}, [selectedDocuments]);

	const getPrompt = useCallback(() => {
		let prompt = `Write a daily report for ${formData.date}.\n\n`;
		
		prompt += ":::instructions\nPlease use the following specific format and details for the report:\n\n";
		
		prompt += `**Employer Name:** ${formData.employerName}\n\n`;
		prompt += `**Project Name/Number:** ${formData.projectName}\n\n`;
		prompt += `**Shift Engineer:** ${formData.shiftEngineer}\n\n`;
		prompt += `**Weather Conditions:** [The workflow should attempt to find this using internet search tool - project is located in ${formData.location}, or state 'Not Available']\n\n`;
		
		prompt += "**Instructions for the Workflow to Generate the Report:**\n\n";

		if (folders.length > 0) {
			prompt += "**Fetch Project Schedule:** First, retrieve the detailed project schedule\n\n";
			prompt += "From attached folder, gather files and images using search agent.\n\n";
			
			folders.forEach((folder) => {
				const attachment = {
					uuid: folder.id,
					name: folder.name,
					specialInstructions: "Analyze folder contents for daily report generation",
				};
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		if (notes.length > 0) {
			prompt += "**Daily Notes and Logs:**\n\n";
			notes.forEach((note) => {
				const attachment = {
					uuid: note.id,
					name: note.name,
					specialInstructions: "Read and analyze daily log content for report generation",
				};
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		if (images.length > 0) {
			prompt += "**Images for Analysis:**\n\n";
			prompt += "Especially images, ensure you obtain its full, directly accessible URL (e.g., the complete https://... ). Also, note the file names and their resource IDs if available.\n";
			prompt += "Ask programming tool to visually analyze each image, with context that TBM disassembly is going on and these might be parts and areas related to TBM disassembly, based on report provide additional context to programming tool so it can visually analyze each image, give the uuid of each image and context for it to visualize, this will help you understand what's happening on site and generate nice caption for each image.\n\n";
			
			images.forEach((image) => {
				const attachment = {
					uuid: image.id,
					name: image.name,
					specialInstructions: "Visually analyze image in context of TBM disassembly work and generate descriptive caption",
				};
				prompt += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		prompt += "\n**Analyze Content and Schedule Impact:**\n\n";
		prompt += "- Read the content of any text-based daily logs or notes found in the date-specific subfolder.\n";
		prompt += `- Correlate the information from these files with the project schedule for ${formData.date}.\n`;
		prompt += "- Analyze this combined information to understand tasks completed, work in progress, any deviations, issues encountered, and critically, assess any impact these might have on the project timeline.\n\n";

		prompt += "**Generate the Full Report:** Compile a comprehensive, well-formatted daily report that includes the following sections, populated with the information gathered:\n\n";
		
		prompt += `- **Employer Name:** ${formData.employerName}\n`;
		prompt += `- **Project Name/Number:** ${formData.projectName}\n`;
		prompt += `- **Shift Engineer:** ${formData.shiftEngineer}\n`;
		prompt += "- **Weather Conditions:** [Report actual conditions if found, otherwise 'Not Available']\n";
		prompt += "- **Shift Report:** Provide a detailed narrative of the day's work, progress on scheduled tasks, and any significant events or observations from the daily files.\n";
		prompt += "- **Assessment:** Offer an analysis of the day's progress, explicitly mentioning any impacts on the project schedule, and highlighting any critical path activities.\n";
		prompt += "- **Attachments:** [If separate document attachments are relevant and found, list their names here. Otherwise, information can be integrated into the Shift Report.]\n";
		prompt += "- **Images:** Embed all relevant images found. Use proper Markdown image syntax: ![Descriptive alt text for image](Image_URL_here). Provide brief, relevant captions.\n\n";

		prompt += "**Final Output Requirements:**\n\n";
		prompt += "- The report must be complete, clearly written, and accurately reflect the day's activities and their context.\n";
		prompt += "- All specified sections must be present and appropriately filled.\n";
		prompt += "- Images must be correctly embedded using proper Markdown and their full URLs, ensuring they are displayable in the final report in md format.\n\n";

		prompt += `Please proceed with generating the daily report for ${formData.date} based on these detailed instructions.\n:::`;

		return prompt;
	}, [formData, folders, notes, images]);

	const handleInputChange = useCallback((field: keyof DailyReportFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Validation: Either folder or notes must be selected
	const isFormValid = formData.date && formData.location && (folders.length > 0 || notes.length > 0);

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Update chat input in real time
	useEffect(() => {
		if (isFormValid && !isWaitingForResponse) {
			const prompt = getPrompt();
			setChatInput(prompt);
		}
	}, [formData, selectedDocuments, folders, notes, images, isFormValid, isWaitingForResponse, getPrompt, setChatInput]);

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
					Daily Report Generator
				</h1>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					Create a comprehensive daily report by selecting your date, location, and relevant documents. 
					Either folder or notes must be selected to proceed.
				</p>

				{/* Date and Location */}
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
							<MapPin className="h-4 w-4" />
							Project Location
						</h2>
						<DocInput
							value={formData.location}
							onChange={(value) => handleInputChange("location", value)}
							placeholder="Enter project location for weather data"
							disabled={isPending}
						/>
					</div>
				</div>

				{/* Project Details */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Project Details
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="text-sm text-gray-500 block mb-1">Employer Name</label>
							<DocInput
								value={formData.employerName}
								onChange={(value) => handleInputChange("employerName", value)}
								placeholder="Jay Dee"
								disabled={isPending}
							/>
						</div>
						<div>
							<label className="text-sm text-gray-500 block mb-1">Project Name/Number</label>
							<DocInput
								value={formData.projectName}
								onChange={(value) => handleInputChange("projectName", value)}
								placeholder="TP-36"
								disabled={isPending}
							/>
						</div>
						<div>
							<label className="text-sm text-gray-500 block mb-1">Shift Engineer</label>
							<DocInput
								value={formData.shiftEngineer}
								onChange={(value) => handleInputChange("shiftEngineer", value)}
								placeholder="Andrew Cozard"
								disabled={isPending}
							/>
						</div>
					</div>
				</div>

				{/* Document Selection Sections */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Select Folders & Files
					</h2>
					<div className="flex items-start gap-2 mb-4">
					<DocRefButton
						onClick={openDocumentPanel}
						hasDocuments={selectedDocuments.length > 0}
						disabled={isPending}
						label="Select documents"
						colorTheme="amber"
					/>
					<InlineDocRef
						documents={folders}
						onRemove={removeDocument}
						disabled={isPending}
						colorTheme="amber"
					/>
					</div>
				</div>

				{/* Notes Section */}
				{notes.length > 0 && (
					<div className="mb-8">
						<h2 className="text-base font-semibold italic text-gray-900 mb-4">
							Selected Notes
						</h2>
						<div className="flex items-start gap-2">
							<InlineDocRef
								documents={notes}
								onRemove={removeDocument}
								disabled={isPending}
								colorTheme="amber"
							/>
						</div>
					</div>
				)}

				{/* Images Section */}
				{images.length > 0 && (
					<div className="mb-8">
						<h2 className="text-base font-semibold italic text-gray-900 mb-4">
							Selected Images
						</h2>
						<div className="flex items-start gap-2">
							<InlineDocRef
								documents={images}
								onRemove={removeDocument}
								disabled={isPending}
								colorTheme="amber"
							/>
						</div>
					</div>
				)}

				{/* Validation message */}
				{!isFormValid && formData.date && formData.location && (
					<div className="mb-8 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
						⚠️ Please select either a folder or notes to generate the daily report.
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
								className="bg-amber-600 hover:bg-amber-700 text-white px-6"
							>
								{isWaitingForResponse ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Generating Report...
									</>
								) : (
									<>
										Generate Daily Report
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
