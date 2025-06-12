import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2, X, Calendar, MapPin, Folder, FileImage, StickyNote } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface DocumentSectionProps {
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
}

const DocumentSection = React.memo(({ 
	label,
	icon,
	documents,
	isPending,
	onRemoveDocument,
	loadDocumentPanel,
	isMultiple = false,
}: DocumentSectionProps) => {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				{icon}
				<Label className="text-sm font-medium text-gray-700">
					{label} {!isMultiple && <span className="text-gray-400">(optional)</span>}
				</Label>
			</div>
			<div className="flex gap-3 items-start">
				<div className="flex-shrink-0">
					{loadDocumentPanel()}
				</div>
				<div className="flex-1 space-y-2">
					{documents.length > 0 ? (
						documents.map((document) => (
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
						))
					) : (
						<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">
							Click the attachment icon to select {label.toLowerCase()}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

DocumentSection.displayName = "DocumentSection";

export default function DailyReport({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
	loadDocumentPanel,
}: DailyReportProps) {
	const { selectedContexts, setSelectedContexts } = useChatStore();
	const { activeChatEntity } = useStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [formData, setFormData] = useState<DailyReportFormData>({
		date: new Date().toISOString()
			.split("T")[0], // Default to today
		location: "Your Project Location", // Default location
		employerName: "Your Company Name",
		projectName: "Your Project Name",
		shiftEngineer: "Your Name",
		selectedFolder: undefined,
		selectedNotes: [],
		selectedImages: [],
	});

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

		// Add folder attachments if any
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

		// Add notes attachments if any
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

		// Add image attachments if any
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

	// Update chat input in real time whenever form data or selected documents change
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

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-[85vh] p-16">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Generate Daily Report
				</h3>
				<p className="text-sm text-gray-600">
					Create a comprehensive daily report by selecting your date, location, and relevant documents. Either folder or notes must be selected to proceed.
				</p>
				{selectedDocuments.length > 0 && (
					<p className="text-xs text-blue-600 mt-2">
						{selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected
					</p>
				)}
			</div>
			<div className="space-y-6">
				{/* Date Selector */}
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
						<MapPin className="h-4 w-4 text-gray-600" />
						<Label className="text-sm font-medium text-gray-700">
							Project Location <span className="text-red-500">*</span>
						</Label>
					</div>
					<Input
						className="w-full"
						disabled={isPending}
						onChange={(e) => handleInputChange("location", e.target.value)}
						placeholder="Enter project location for weather data"
						required
						type="text"
						value={formData.location}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Employer Name</Label>
						<Input
							disabled={isPending}
							onChange={(e) => handleInputChange("employerName", e.target.value)}
							placeholder="Jay Dee"
							type="text"
							value={formData.employerName}
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Project Name/Number</Label>
						<Input
							disabled={isPending}
							onChange={(e) => handleInputChange("projectName", e.target.value)}
							placeholder="TP-36"
							type="text"
							value={formData.projectName}
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Shift Engineer</Label>
						<Input
							disabled={isPending}
							onChange={(e) => handleInputChange("shiftEngineer", e.target.value)}
							placeholder="Andrew Cozard"
							type="text"
							value={formData.shiftEngineer}
						/>
					</div>
				</div>
				<DocumentSection
					documents={folders}
					icon={<Folder className="h-4 w-4 text-gray-600" />}
					isPending={isPending}
					label="Select Folder"
					loadDocumentPanel={loadDocumentPanel}
					onRemoveDocument={removeDocument}
				/>
				<DocumentSection
					documents={notes}
					icon={<StickyNote className="h-4 w-4 text-gray-600" />}
					isMultiple
					isPending={isPending}
					label="Select Notes"
					loadDocumentPanel={loadDocumentPanel}
					onRemoveDocument={removeDocument}
				/>
				<DocumentSection
					documents={images}
					icon={<FileImage className="h-4 w-4 text-gray-600" />}
					isMultiple
					isPending={isPending}
					label="Select Images"
					loadDocumentPanel={loadDocumentPanel}
					onRemoveDocument={removeDocument}
				/>
				{!isFormValid && formData.date && formData.location && (
					<div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
						⚠️ Please select either a folder or notes to generate the daily report.
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
							Generate Daily Report
							<CornerDownLeft className="h-4 w-4 ml-2" />
						</>
					)}
				</Button>
			</div>
		</ScrollArea>
	);
} 