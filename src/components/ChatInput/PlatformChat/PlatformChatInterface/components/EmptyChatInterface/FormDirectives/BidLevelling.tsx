import React, { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CornerDownLeft, Loader2, X, Plus } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { ScrollArea } from "@/components/ui/scroll-area";
interface BidLevellingProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface BidLevellingFormData {
	bidDescriptions: { [key: string]: string };
	scopeDescription: string;
	optionalInstructions: string;
	finalDocumentName: string;
	selectedDocuments: Array<{
		id: string;
		name: string;
		extension: string;
	}>;
}

interface BidSectionProps {
	bidNumber: number;
	documentIndex: number;
	isRequired?: boolean;
	isPending: boolean;
	description: string;
	document?: {
		id: string;
		name: string;
		extension: string;
	};
	onDescriptionChange: (bidKey: string, value: string) => void;
	onRemoveDocument: (docId: string) => void;
	onRemoveBid: (bidNumber: number) => void;
	loadDocumentPanel: () => React.ReactNode;
}

const BidSection = React.memo(({ 
	bidNumber,
	documentIndex,
	isRequired = false,
	isPending,
	description,
	document,
	onDescriptionChange,
	onRemoveDocument,
	onRemoveBid,
	loadDocumentPanel,
}: BidSectionProps) => {
	const bidKey = `bid${bidNumber}`;
	
	// Use document name as label, fallback to generic bid label
	const labelText = document?.name || `Bid ${bidNumber}`;
	const truncatedLabel = labelText.length > 30 ? `${labelText.substring(0, 30)}...` : labelText;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium text-gray-700" title={document?.name}>
					{truncatedLabel} {isRequired && <span className="text-red-500">*</span>}
				</Label>
				{!isRequired && (
					<Button
						className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
						disabled={isPending}
						onClick={() => onRemoveBid(bidNumber)}
						size="sm"
						title={`Remove Bid ${bidNumber}`}
						type="button"
						variant="ghost"
					>
						<X className="h-3 w-3" />
					</Button>
				)}
			</div>
			<div className="flex gap-3 items-start">
				<div className="flex-shrink-0">
					{loadDocumentPanel()}
				</div>
				<div className="flex-1 space-y-2">
					{document && (
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
					)}						
					<Textarea
						className="w-full resize-none"
						disabled={isPending}
						onChange={(e) => onDescriptionChange(bidKey, e.target.value)}
						placeholder={`Formatting, markups , composition information about ${document?.name || `bid ${bidNumber}`}...`}
						value={description}
					/>
				</div>
			</div>
		</div>
	);
});

BidSection.displayName = "BidSection";

interface DocumentSectionProps {
	label: string;
	descriptionKey: keyof BidLevellingFormData;
	documentIndex?: number;
	isOptional?: boolean;
	isPending: boolean;
	description: string;
	document?: {
		id: string;
		name: string;
		extension: string;
	};
	onInputChange: (field: keyof BidLevellingFormData, value: string) => void;
	onRemoveDocument: (docId: string) => void;
	loadDocumentPanel: () => React.ReactNode;
}

const DocumentSection = React.memo(({ 
	label, 
	descriptionKey, 
	documentIndex,
	isOptional = false,
	isPending,
	description,
	document,
	onInputChange,
	onRemoveDocument,
	loadDocumentPanel,
}: DocumentSectionProps) => {
	// Use document name as label, fallback to provided label
	const labelText = document?.name || label;
	const truncatedLabel = labelText.length > 30 ? `${labelText.substring(0, 30)}...` : labelText;

	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium text-gray-700" title={document?.name || label}>
				{truncatedLabel} {isOptional && <span className="text-gray-400">(optional)</span>}
			</Label>
			<div className="flex gap-3 items-start">
				<div className="flex-shrink-0">
					{loadDocumentPanel()}
				</div>
				<div className="flex-1 space-y-2">
					{document && (
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
					)}
					<Textarea
						className="w-full resize-none"
						disabled={isPending}
						onChange={(e) => onInputChange(descriptionKey, e.target.value)}
						placeholder={`How to use ${document?.name || label.toLowerCase()}...`}
						value={description}
					/>
				</div>
			</div>
		</div>
	);
});

DocumentSection.displayName = "DocumentSection";

export default function BidLevelling({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
	loadDocumentPanel,
}: BidLevellingProps) {
	const { selectedContexts, setSelectedContexts } = useChatStore();
	const { activeChatEntity } = useStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const selectedDocuments = selectedContexts[currentChatId] || [];

	const [bidCount, setBidCount] = useState(2); // Start with 2 bids
	const [formData, setFormData] = useState<BidLevellingFormData>({
		bidDescriptions: {
			bid1: "",
			bid2: "",
		},
		scopeDescription: "",
		optionalInstructions: "",
		finalDocumentName: "",
		selectedDocuments: [],
	});

	const getPrompt = useCallback(() => {
		const bidDocuments = selectedDocuments.slice(0, bidCount);
		const scopeDocument = selectedDocuments[bidCount];
		const additionalDocuments = selectedDocuments.slice(bidCount + 1);
		const documentName = formData.finalDocumentName.trim() || "";

		let prompt = "You have been provided with the following bid documents for leveling:\n\n";

		// Add bid documents
		bidDocuments.forEach((doc, index) => {
			const bidNumber = index + 1;
			const bidKey = `bid${bidNumber}`;
			const specialInstructions = formData.bidDescriptions[bidKey] || "";
			
			prompt += `**Document ${bidNumber}: ${doc.name}**\n`;
			const attachment = {
				uuid: doc.id,
				name: doc.name,
				specialInstructions: specialInstructions.trim(),
			};
			prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
		});
		// Add additional documents if any

		// Add scope document if available
		if (scopeDocument) {
			prompt += `**Scope Document: ${scopeDocument.name}**\n`;
			const attachment = {
				uuid: scopeDocument.id,
				name: scopeDocument.name,
				specialInstructions: formData.scopeDescription.trim(),
			};
			prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
		}


		prompt += `**Level the bids based on the provided documents**
:::instructions
**Instructions:**
1. In order to level the bids, first setup a task planner by creating a file called "task.md" in sandbox.
2. In the task.md file create list of tasks that are required to successfully level the bids.
    [ ] Copy the attached bid and scope document to the sandbox.
	[ ] Create a file called "analysis_bid_document_name.md" for each bid document included.
	[ ] Create a file called "final_analysis.md" which will contain the final analysis of the bid.
	${scopeDocument ? `
	[ ] Create a file called analysis_scope_document.md which will contain the analysis of the scope document.` : ""}
	([ ] Understand the bid attached document_name ; To understand the bid document examine the file from sandbox if there is special formatting or markups etc. Otherwise simply read the file, include special instruction for the respective bid document here.${scopeDocument ? `
	[ ] Understand and analyze the scope document` : ""}
	[ ] For the bid name, write executive summary of the bid documents.
	[ ] For the bid name, write a detailed exclusions section.
	[ ] write the special concerns, obscure language section) x **repeat for each bid file attached**
	[ ] Compile the results in final_analysis.md file.${scopeDocument ? " [ ] For scope item, each and every scope item should be included as a item in the final analysis document. The goal is to understand the which part of scope is included in the bid document." : ""}
	[ ] Upload the sandbox files to project documents for review.
	${documentName ? `
	[ ] Only when all steps have been completed take on the final formatting task. Format the final results -  ${documentName} and upload it to project documents for review.` : ""}
3. Go through the items of the task.md file and complete the task one by one. Once you complete each task, mark the task as done by updating [ ] task to [x] task in the task.md file.`;

		// Add optional instructions if provided
		if (formData.optionalInstructions.trim()) {
			prompt += `\n**Additional Instructions:** \n${formData.optionalInstructions.trim()}\n`;
		}

		prompt += "\n:::\n";

		return prompt;
	}, [selectedDocuments, bidCount, formData]);

	const handleBidDescriptionChange = useCallback((bidKey: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			bidDescriptions: {
				...prev.bidDescriptions,
				[bidKey]: value,
			},
		}));
	}, []);

	const handleInputChange = useCallback((field: keyof BidLevellingFormData, value: string) => {
		if (field === "bidDescriptions") return; // Handle separately
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Check if required bids have descriptions
	const requiredBidsValid = formData.bidDescriptions["bid1"]?.trim() ;
	const isFormValid = selectedDocuments.length >= 1 && requiredBidsValid;

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Update chat input in real time whenever form data or selected documents change
	useEffect(() => {
		if (selectedDocuments.length >= 2 && requiredBidsValid && !isWaitingForResponse) {
			const prompt = getPrompt();
			setChatInput(prompt);
		}
	}, [selectedDocuments, bidCount, formData, getPrompt, setChatInput, requiredBidsValid, isWaitingForResponse]);

	const removeDocument = useCallback((docId: string) => {
		const newContexts = selectedDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(currentChatId, newContexts);
	}, [selectedDocuments, setSelectedContexts, currentChatId]);

	const addMoreBid = useCallback(() => {
		const newBidCount = bidCount + 1;
		setBidCount(newBidCount);
		setFormData((prev) => ({
			...prev,
			bidDescriptions: {
				...prev.bidDescriptions,
				[`bid${newBidCount}`]: "",
			},
		}));
	}, [bidCount]);

	const removeBid = useCallback((bidNumber: number) => {
		if (bidNumber <= 1) return; // Cannot remove required bids

		const newBidCount = bidCount - 1;
		setBidCount(newBidCount);

		// Remove the bid description and reorder remaining bids
		const updatedDescriptions = { ...formData.bidDescriptions };
		
		// Remove the target bid
		delete updatedDescriptions[`bid${bidNumber}`];
		
		// Reorder bids that come after the removed one
		for (let i = bidNumber + 1; i <= bidCount; i++) {
			if (updatedDescriptions[`bid${i}`]) {
				updatedDescriptions[`bid${i - 1}`] = updatedDescriptions[`bid${i}`];
				delete updatedDescriptions[`bid${i}`];
			}
		}

		setFormData((prev) => ({
			...prev,
			bidDescriptions: updatedDescriptions,
		}));
	}, [bidCount, formData.bidDescriptions]);

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-[85vh] p-16">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Select documents for bid levelling
				</h3>
				<p className="text-sm text-gray-600">
					Choose your bid documents and provide context for analysis. Click on the attachment icon and select files from the side panel by clicking the + button.
				</p>
				{selectedDocuments.length > 0 && (
					<p className="text-xs text-blue-600 mt-2">
						{selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected
					</p>
				)}
			</div>
			<div className="space-y-6">
				{/* Bid Sections */}
				{Array.from({ length: bidCount }, (_, index) => {
					const bidNumber = index + 1;
					const bidKey = `bid${bidNumber}`;
					return (
						<BidSection
							bidNumber={bidNumber}
							description={formData.bidDescriptions[bidKey] || ""}
							document={selectedDocuments[index]}
							documentIndex={index}
							isPending={isPending}
							isRequired={index < 1} // First 2 bids are required
							key={bidKey}
							loadDocumentPanel={loadDocumentPanel}
							onDescriptionChange={handleBidDescriptionChange}
							onRemoveBid={removeBid}
							onRemoveDocument={removeDocument}
						/>
					);
				})}
				<div className="flex justify-center">
					<Button
						className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
						disabled={isPending}
						onClick={addMoreBid}
						type="button"
						variant="outline"
					>
						<Plus className="h-4 w-4" />
						Add More Bid
					</Button>
				</div>
				<DocumentSection
					description={formData.scopeDescription}
					descriptionKey="scopeDescription"
					document={selectedDocuments[bidCount]}
					documentIndex={bidCount} // Scope starts after all bids
					isOptional
					isPending={isPending}
					label="Scope item"
					loadDocumentPanel={loadDocumentPanel}
					onInputChange={handleInputChange}
					onRemoveDocument={removeDocument}
				/>
				{selectedDocuments.length > bidCount + 1 && (
					<div className="space-y-3">
						<Label className="text-sm font-medium text-gray-700">
							Additional documents
						</Label>
						<div className="space-y-2">
							{selectedDocuments.slice(bidCount + 1).map((document, index) => (
								<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" key={document.id}>
									<FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
									<span className="text-sm text-gray-900 truncate flex-1" title={document.name}>
										{document.name}
									</span>
									<Button
										className="h-6 w-6 p-0 hover:bg-gray-200"
										disabled={isPending}
										onClick={() => removeDocument(document.id)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-3 w-3 text-gray-600" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Final analysis document formatting instructions
					</Label>
					<Input
						className="min-h-12 resize-none"
						disabled={isPending}
						onChange={(e) => handleInputChange("finalDocumentName", e.target.value)}
						placeholder="Include instructionslike name, format, should it mirror original scope document do you need tabulated results etc."
						value={formData.finalDocumentName}
					/>
				</div>
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Optional instructions
					</Label>
					<Textarea
						className="min-h-20 "
						disabled={isPending}
						onChange={(e) => handleInputChange("optionalInstructions", e.target.value)}
						placeholder="Any additional instructions or context for the bid analysis..."
						value={formData.optionalInstructions}
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
							Analyzing...
						</>
					) : (
						<>
							Analyze Bids
							<CornerDownLeft className="h-4 w-4 ml-2" />
						</>
					)}
				</Button>
			</div>
		</ScrollArea>
	);
}
