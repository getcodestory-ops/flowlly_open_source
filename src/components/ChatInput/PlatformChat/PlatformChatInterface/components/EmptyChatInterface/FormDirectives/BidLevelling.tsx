import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, X, Plus } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useViewStore } from "@/utils/store";
import { DocTextArea, DocInput, DocRefButton, InlineDocRef } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

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
}

export default function BidLevelling({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput: _setChatInput,
	handleSubmit,
}: BidLevellingProps) {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed, setChatContext } = useChatStore();
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();

	// Generate a unique form ID for this bid levelling instance
	const [formId] = useState(() => `bid_levelling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

	const [bidCount, setBidCount] = useState(2);
	const [formData, setFormData] = useState<BidLevellingFormData>({
		bidDescriptions: {
			bid1: "",
			bid2: "",
		},
		scopeDescription: "",
		optionalInstructions: "",
		finalDocumentName: "",
	});

	// Helper function to get section-specific context ID
	const getSectionContextId = useCallback((sectionKey: string) => {
		return `${formId}_${sectionKey}`;
	}, [formId]);

	// Helper function to get selected documents for a specific section
	const getSelectedDocuments = useCallback((sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		return selectedContexts[contextId] || [];
	}, [selectedContexts, getSectionContextId]);

	// Document panel opener
	const openDocumentPanel = useCallback((sectionKey: string, title: string, singleSelect: boolean = false) => {
		const contextId = getSectionContextId(sectionKey);
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: contextId,
			contextId: contextId,
			title: title,
			singleSelect: singleSelect,
		});
	}, [setCollapsed, setSidePanel, getSectionContextId]);

	const removeDocument = useCallback((docId: string, sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		const newContexts = sectionDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, getSectionContextId]);

	const getPrompt = useCallback(() => {
		let prompt = "You have been provided with the following bid documents for leveling:\n\n";

		// Add bid documents
		for (let i = 1; i <= bidCount; i++) {
			const sectionKey = `bid_${i}`;
			const bidDocuments = getSelectedDocuments(sectionKey);
			const bidKey = `bid${i}`;
			const specialInstructions = formData.bidDescriptions[bidKey] || "";

			if (bidDocuments.length > 0) {
				bidDocuments.forEach((doc) => {
					prompt += `**Document ${i}: ${doc.name}**\n`;
					const attachment = {
						uuid: doc.id,
						name: doc.name,
						specialInstructions: specialInstructions.trim(),
					};
					prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
				});
			}
		}

		// Add scope document if available
		const scopeDocuments = getSelectedDocuments("scope");
		if (scopeDocuments.length > 0) {
			scopeDocuments.forEach((doc) => {
				prompt += `**Scope Document: ${doc.name}**\n`;
				const attachment = {
					uuid: doc.id,
					name: doc.name,
					specialInstructions: formData.scopeDescription.trim(),
				};
				prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		// Add additional documents if any
		const additionalDocuments = getSelectedDocuments("additional");
		if (additionalDocuments.length > 0) {
			additionalDocuments.forEach((doc) => {
				prompt += `**Additional Document: ${doc.name}**\n`;
				const attachment = {
					uuid: doc.id,
					name: doc.name,
					specialInstructions: "",
				};
				prompt += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		const documentName = formData.finalDocumentName.trim() || "";

		prompt += `**Level the bids based on the provided documents**
:::instructions
**Instructions:**
    1. Copy the attached bids and scope documents to the sandbox.
	2. Examine the bid document thoroughly. At least run secondary examine file from sandbox operation with different query on bid document to make sure that all the numbers extracted and ocred are correct. 
	3. Understand the attached documents, including provided bids and scope document if provided.
	4. Understand special concerns, obscure language sections etc. in the bid documents corrresponding to the scope items.
	${scopeDocuments.length > 0 ? "For scope item, each and every scope item should be included as a item in the final analysis document. The goal is to understand the which part of scope is included in the bid document." : ""}
	Generate your analysis in a tabular format, preferably in markdown format. The table will have the following columns: item (should include all the scope items idividually), (For each bidder) one column for the scope item status (included, excluded, Unsure) a second column with evidence of the status (include the file name, page and quote). Any other comments or special instructions should be included in the analysis document.
	6. For any calculations, sum of total numbers etc. use calculation operation, excel sheet formulas, programming operations etc. to make sure that the calculations are correct.
	${documentName ? `
	Format the final results -  ${documentName} and upload it to project documents for review. keep your final response concise and to the point like see attached analysis for bid leveling.` : ""}`;
		if (formData.optionalInstructions.trim()) {
			prompt += `\n**Additional Instructions:** \n${formData.optionalInstructions.trim()}\n`;
		}

		prompt += "\n:::\n";

		return prompt;
	}, [bidCount, formData, getSelectedDocuments]);

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
		if (field === "bidDescriptions") return;
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Check if required bids have documents (descriptions are now optional)
	const requiredBidsValid = useMemo(() => {
		const bid1Documents = getSelectedDocuments("bid_1");
		return bid1Documents.length > 0;
	}, [getSelectedDocuments]);

	const isFormValid = requiredBidsValid;

	const handleFormSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	// Update chat context in real time
	useEffect(() => {
		if (isFormValid && !isWaitingForResponse) {
			const prompt = getPrompt();
			setChatContext(prompt);
		}
	}, [bidCount, formData, getPrompt, setChatContext, isFormValid, isWaitingForResponse, selectedContexts]);

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
		if (bidNumber <= 1) return;

		const newBidCount = bidCount - 1;
		setBidCount(newBidCount);

		const updatedDescriptions = { ...formData.bidDescriptions };
		delete updatedDescriptions[`bid${bidNumber}`];

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

		const removedBidContextId = getSectionContextId(`bid_${bidNumber}`);
		setSelectedContexts(removedBidContextId, []);
	}, [bidCount, formData.bidDescriptions, getSectionContextId, setSelectedContexts]);

	// Calculate total selected documents
	const totalSelectedDocuments = useMemo(() => {
		let total = 0;
		for (let i = 1; i <= bidCount; i++) {
			total += getSelectedDocuments(`bid_${i}`).length;
		}
		total += getSelectedDocuments("scope").length;
		total += getSelectedDocuments("additional").length;
		return total;
	}, [bidCount, getSelectedDocuments, selectedContexts]);

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
							{/* Document Title */}
							<h1 className="text-3xl font-normal text-gray-900 mb-4">
								Bid Levelling (fast)
							</h1>

							{/* Description */}
							<p className="text-gray-600 mb-10 leading-relaxed">
								Choose your bid documents and provide additional context for analysis. Click on the attachment
								icon and select files from the side panel by selecting the context.
							</p>

							{/* Reference bid documents section */}
							<div className="mb-8">
								<h2 className="text-base font-semibold italic text-gray-900 mb-4">
									Reference bid documents
								</h2>

								{/* Bid sections */}
								{Array.from({ length: bidCount }, (_, index) => {
									const bidNumber = index + 1;
									const bidKey = `bid${bidNumber}`;
									const sectionKey = `bid_${bidNumber}`;
									const bidDocuments = getSelectedDocuments(sectionKey);
									const isRequired = index < 1;

									return (
										<div key={bidKey} className="mb-6">
											<div className="flex items-start gap-2 mb-2">
								<DocRefButton
									onClick={() => openDocumentPanel(sectionKey, `Select Bid ${bidNumber} Document`, true)}
									hasDocuments={bidDocuments.length > 0}
									disabled={isPending}
									label={`Select bid ${bidNumber}`}
									colorTheme="emerald"
								/>
								<InlineDocRef
									documents={bidDocuments}
									onRemove={(id) => removeDocument(id, sectionKey)}
									disabled={isPending}
									colorTheme="emerald"
								/>
												{!isRequired && (
													<button
														onClick={() => removeBid(bidNumber)}
														disabled={isPending}
														className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
													>
														<X className="h-4 w-4" />
													</button>
												)}
											</div>
										<DocTextArea
											value={formData.bidDescriptions[bidKey] || ""}
											onChange={(value) => handleBidDescriptionChange(bidKey, value)}
											placeholder={`Optional: formatting notes, markups, or special instructions for this bid...`}
											disabled={isPending}
										/>
										</div>
									);
								})}

								{/* Add more bid button */}
								<button
									onClick={addMoreBid}
									disabled={isPending}
									className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
								>
									<Plus className="h-4 w-4" />
									<span>Add another bid</span>
								</button>
							</div>

							{/* Scope item section */}
							<div className="mb-8">
								<h2 className="text-base font-semibold italic text-gray-900 mb-4">
									Do you have the original scope item
								</h2>
								<div className="flex items-start gap-2 mb-2">
							<DocRefButton
								onClick={() => openDocumentPanel("scope", "Select Scope Document")}
								hasDocuments={getSelectedDocuments("scope").length > 0}
								disabled={isPending}
								label="Select scope document"
								colorTheme="emerald"
							/>
								<InlineDocRef
									documents={getSelectedDocuments("scope")}
									onRemove={(id) => removeDocument(id, "scope")}
									disabled={isPending}
									colorTheme="emerald"
								/>
								</div>
								<DocTextArea
									value={formData.scopeDescription}
									onChange={(value) => handleInputChange("scopeDescription", value)}
									placeholder="Optional: describe how to use the scope document..."
									disabled={isPending}
								/>
							</div>

							{/* Additional documents section */}
							<div className="mb-8">
								<h2 className="text-base font-semibold italic text-gray-900 mb-4">
									Additional reference documents
								</h2>
								<div className="flex items-start gap-2">
							<DocRefButton
								onClick={() => openDocumentPanel("additional", "Select Additional Documents")}
								hasDocuments={getSelectedDocuments("additional").length > 0}
								disabled={isPending}
								label="Select additional documents"
								colorTheme="emerald"
							/>
								<InlineDocRef
									documents={getSelectedDocuments("additional")}
									onRemove={(id) => removeDocument(id, "additional")}
									disabled={isPending}
									colorTheme="emerald"
								/>
								</div>
							</div>

							{/* Final document name section */}
							<div className="mb-12">
								<h2 className="text-base font-semibold italic text-gray-900 mb-4">
									Final analysis document formatting
								</h2>
								<DocInput
									value={formData.finalDocumentName}
									onChange={(value) => handleInputChange("finalDocumentName", value)}
									placeholder="Include instructions like name, format, should it mirror original scope document..."
									disabled={isPending}
								/>
							</div>

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
											className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
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
								</div>
							</div>
			</div>
		</div>
	);
}
