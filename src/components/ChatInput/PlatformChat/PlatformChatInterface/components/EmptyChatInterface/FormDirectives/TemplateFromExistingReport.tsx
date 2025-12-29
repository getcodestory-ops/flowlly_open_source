import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useViewStore } from "@/utils/store";
import { generateTemplatePrompt, generateAttachmentsSection } from "./templatePrompts";
import { DocInput, DocRefButton, InlineDocRef, type DocItem } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";

interface Props {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

type SelectedDoc = DocItem;

export default function TemplateFromExistingReport({ isPending = false, isWaitingForResponse = false, setChatInput, handleSubmit }: Props): React.JSX.Element {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed, chatInput } = useChatStore();
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();

	// Stable form-scoped ID so each section has its own selection context
	const [formId] = useState(() => `ai_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
	const getSectionContextId = useCallback((sectionKey: string) => `${formId}_${sectionKey}`, [formId]);
	const getSelectedDocuments = useCallback((sectionKey: string): SelectedDoc[] => {
		return selectedContexts[getSectionContextId(sectionKey)] || [];
	}, [selectedContexts, getSectionContextId]);

	const openDocumentPanel = useCallback((sectionKey: string, title: string) => {
		const contextId = getSectionContextId(sectionKey);
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: contextId,
			contextId: contextId,
			title,
		});
	}, [setCollapsed, setSidePanel, getSectionContextId]);

	const removeDocument = useCallback((sectionKey: string, docId: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		const newContexts = sectionDocuments.filter((d) => d.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, getSectionContextId]);

	// Controlled fields
	const [templateName, setTemplateName] = useState("");

	// Read per-section selections
	const referenceReports: SelectedDoc[] = getSelectedDocuments("reports");
	const logoImages: SelectedDoc[] = getSelectedDocuments("logo");
	const coverImages: SelectedDoc[] = getSelectedDocuments("cover");
	const additionalRefs: SelectedDoc[] = getSelectedDocuments("additional");

	const isFormValid = useMemo(() => templateName.trim().length > 0 && referenceReports.length > 0, [templateName, referenceReports.length]);

	const getPrompt = useCallback((): string => {
		const mainPrompt = generateTemplatePrompt({
			templateName,
		});

		const attachmentsSection = generateAttachmentsSection(
			referenceReports,
			logoImages,
			coverImages,
			additionalRefs,
		);

		return mainPrompt + "\n\n" + attachmentsSection;
	}, [templateName, referenceReports, logoImages, coverImages, additionalRefs]);

	useEffect(() => {
		if (!isFormValid || isWaitingForResponse) return;
		const nextPrompt = getPrompt();
		if (nextPrompt !== chatInput) {
			setChatInput(nextPrompt);
		}
	}, [isFormValid, isWaitingForResponse, getPrompt, chatInput, setChatInput]);

	const onSubmit = useCallback(() => {
		handleSubmit();
	}, [handleSubmit]);

	const totalSelectedDocuments = referenceReports.length + logoImages.length + coverImages.length + additionalRefs.length;

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
				{/* Document Title */}
				<h1 className="text-3xl font-normal text-gray-900 mb-4">
					AI-Assisted Template Builder
				</h1>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					Attach an existing report along with brand assets and we will draft a reusable template for you.
				</p>

				{/* Template Name */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Template Name
					</h2>
					<DocInput
						value={templateName}
						onChange={setTemplateName}
						placeholder="e.g., Monthly Progress Report"
						disabled={isPending}
					/>
				</div>

				{/* Existing Reports */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Existing Report(s)
					</h2>
					<div className="flex items-start gap-2">
					<DocRefButton
						onClick={() => openDocumentPanel("reports", "Select reports (PDF/DOCX)")}
						hasDocuments={referenceReports.length > 0}
						disabled={isPending}
						label="Select reports"
						colorTheme="violet"
					/>
				</div>
				<InlineDocRef
					documents={referenceReports}
					onRemove={(id) => removeDocument("reports", id)}
					disabled={isPending}
					colorTheme="violet"
					layout="stacked"
				/>
					{referenceReports.length === 0 && (
						<p className="text-xs text-gray-400 mt-2">
							Attach one or more reports (PDF, DOCX, etc.)
						</p>
					)}
				</div>

				{/* Logo Images - Optional */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Logo Images <span className="text-gray-400 font-normal">(optional)</span>
					</h2>
					<div className="flex items-start gap-2">
					<DocRefButton
						onClick={() => openDocumentPanel("logo", "Select logo images")}
						hasDocuments={logoImages.length > 0}
						disabled={isPending}
						label="Select logos"
						colorTheme="violet"
					/>
				</div>
				<InlineDocRef
					documents={logoImages}
					onRemove={(id) => removeDocument("logo", id)}
					disabled={isPending}
					colorTheme="violet"
					layout="stacked"
				/>
				</div>

				{/* Cover Images - Optional */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Cover Images <span className="text-gray-400 font-normal">(optional)</span>
					</h2>
					<div className="flex items-start gap-2">
					<DocRefButton
						onClick={() => openDocumentPanel("cover", "Select cover images")}
						hasDocuments={coverImages.length > 0}
						disabled={isPending}
						label="Select cover images"
						colorTheme="violet"
					/>
				</div>
				<InlineDocRef
					documents={coverImages}
					onRemove={(id) => removeDocument("cover", id)}
					disabled={isPending}
					colorTheme="violet"
					layout="stacked"
				/>
				</div>

				{/* Additional References - Optional */}
				<div className="mb-12">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Additional References <span className="text-gray-400 font-normal">(optional)</span>
					</h2>
					<div className="flex items-start gap-2">
					<DocRefButton
						onClick={() => openDocumentPanel("additional", "Select additional files")}
						hasDocuments={additionalRefs.length > 0}
						disabled={isPending}
						label="Select additional files"
						colorTheme="violet"
					/>
				</div>
				<InlineDocRef
					documents={additionalRefs}
					onRemove={(id) => removeDocument("additional", id)}
					disabled={isPending}
					colorTheme="violet"
					layout="stacked"
				/>
				</div>

				{/* Validation message */}
				{!isFormValid && templateName && (
					<div className="mb-8 p-3 bg-violet-50 border border-violet-200 rounded text-sm text-violet-700">
						⚠️ Attach at least one existing report (PDF/DOCX/etc.)
					</div>
				)}

				{/* Status and submit */}
				<div className="pt-6 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							{totalSelectedDocuments > 0 && (
								<span>{totalSelectedDocuments} file{totalSelectedDocuments !== 1 ? "s" : ""} attached</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							<ModelSelector 
								selectedModel={preferredModel}
								onModelChange={setPreferredModel}
								selectedAgentType={preferredAgentType}
							/>
							<Button
								onClick={onSubmit}
								disabled={isWaitingForResponse || !isFormValid}
								className="bg-violet-600 hover:bg-violet-700 text-white px-6"
							>
								{isWaitingForResponse ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Preparing prompt...
									</>
								) : (
									<>
										Start AI Template Draft
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
