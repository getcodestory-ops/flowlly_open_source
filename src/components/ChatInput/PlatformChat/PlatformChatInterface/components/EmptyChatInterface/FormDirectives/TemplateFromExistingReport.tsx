import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Palette, CornerDownLeft, Loader2, X, Paperclip } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateTemplatePrompt, generateAttachmentsSection } from "./templatePrompts";

interface Props {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode; // kept for signature compatibility, not used here
}

type SelectedDoc = { id: string; name: string; extension: string };

export default function TemplateFromExistingReport({ isPending = false, isWaitingForResponse = false, setChatInput, handleSubmit }: Props): React.JSX.Element {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed, chatInput } = useChatStore();

	// Stable form-scoped ID so each section has its own selection context
	const [formId] = useState(() => `ai_template_${Date.now()}_${Math.random().toString(36)
		.substr(2, 9)}`);
	const getSectionContextId = useCallback((sectionKey: string) => `${formId}_${sectionKey}`, [formId]);
	const getSelectedDocuments = useCallback((sectionKey: string): SelectedDoc[] => {
		return selectedContexts[getSectionContextId(sectionKey)] || [];
	}, [selectedContexts, getSectionContextId]);

	const loadSectionDocumentPanel = useCallback((sectionKey: string, title: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		return (
			<Button
				className={`text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2 ${sectionDocuments.length > 0 ? "text-indigo-500 bg-indigo-50/50" : ""}`}
				disabled={false}
				onClick={() => {
					setCollapsed(true);
					setSidePanel({
						isOpen: true,
						type: "folder",
						resourceId: contextId,
						contextId: contextId,
						title,
					});
				}}
				size="sm"
				title={sectionDocuments.length > 0 ? `${sectionDocuments.length} file(s) selected` : "Add files"}
				type="button"
				variant="ghost"
			>
				<Paperclip className="h-4 w-4" />
			</Button>
		);
	}, [selectedContexts, setCollapsed, setSidePanel, getSectionContextId]);

	const removeDocument = useCallback((sectionKey: string, docId: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		const newContexts = sectionDocuments.filter((d) => d.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, getSectionContextId]);

	// Controlled fields
	const [templateName, setTemplateName] = useState("");
	const [additionalNotes, setAdditionalNotes] = useState("");
	const [stylePreset, setStylePreset] = useState<"modern" | "classic">("modern");
	const [primaryColor, setPrimaryColor] = useState<string>("");

	// Read per-section selections
	const referenceReports: SelectedDoc[] = getSelectedDocuments("reports");
	const logoImages: SelectedDoc[] = getSelectedDocuments("logo");
	const coverImages: SelectedDoc[] = getSelectedDocuments("cover");
	const additionalRefs: SelectedDoc[] = getSelectedDocuments("additional");

	const isFormValid = useMemo(() => templateName.trim().length > 0 && referenceReports.length > 0, [templateName, referenceReports.length]);

	const baseHtmlTemplate = useMemo(() => {
		// Minimal, prefilled HTML skeleton with Paged.js and sane defaults
		return [
			"<!doctype html>",
			"<html>",
			"<head>",
			"  <meta charset=\"utf-8\"/>",
			"  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>",
			"  <script src=\"https://unpkg.com/pagedjs/dist/paged.polyfill.js\"></script>",
			"  <style>",
			"    /* Paged.js preview styles, Flowlly - important to keep for the user to see the preview page layout */",
			"    body { background-color: #EEE; }",
			"    .pagedjs_pages { display: flex; flex-direction: column; align-items: center; width: 100%; }",
			"    .pagedjs_page { background: white; box-shadow: 0 0 10px rgba(0,0,0,0.2); margin-bottom: 20px; }",
			"    /* Basic A4 preset + minimal classes. Flowlly - Expand full styling as required. */",
			"    @page {",
			"      size: A4;",
			"      margin: 20mm 18mm 24mm 18mm;",
			"      /* Example running footer with page numbers (Paged.js) */",
			"      @bottom-right { content: 'Page ' counter(page) ' of ' counter(pages); font-size: 9pt; color: #64748b; }",
			"    }",
			"    :root { --brand: #3b82f6; --text: #0f172a; --muted: #64748b; }",
			"    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, \"Helvetica Neue\", Arial; color: var(--text); line-height: 1.5; font-size: 11pt; }",
			"    h1 { font-size: 24pt; font-weight: 700; color: var(--brand); margin: 0 0 6pt 0; }",
			"    h2 { font-size: 18pt; font-weight: 600; color: var(--brand); margin: 16pt 0 6pt 0; }",
			"    h3 { font-size: 14pt; font-weight: 600; color: var(--brand); margin: 12pt 0 6pt 0; }",
			"    p { margin: 0 0 8pt 0; }",
			"    .cover { page: cover; display: grid; place-items: center; height: 100vh; text-align: center; }",
			"    .content-start { break-before: page; }",
			"    .table { width: 100%; border-collapse: collapse; font-size: 10pt; }",
			"    .table th, .table td { border: 1px solid #e2e8f0; padding: 6pt; }",
			"  </style>",
			"</head>",
			"<body>",
			"  <!-- TEMPLATE NOTES: -->",
			"  <!-- 1) Keep body flat: use only h1/h2/h3, p, ul/ol/li, img, hr, and .table (table/thead/tbody/tr/th/td). No nested containers. -->",
			"  <!-- 2) No inline styles or scripts in body. Only class names are allowed. All CSS/JS must be in <head>. -->",
			"  <!-- 3) Add a comment block describing each section's data source, inputs, and mapping before finalizing. -->",
			"  <div class=\"cover\">",
			"    <!-- The agent will reconstruct this cover based on the provided example and brand assets -->",
			"    <h1>Report Title</h1>",
			"    <h2>Subtitle</h2>",
			"    <p>Date</p>",
			"  </div>",
			"  <div class=\"content-start\"></div>",
			"  <!-- IMPORTANT: Keep content flat. Do not nest divs inside divs. Use headings, paragraphs, lists, and tables. -->",
			"  <h1 class=\"page-break\">Executive Summary</h1>",
			"  <p>Brief summary...</p>",
			"  <h2 class=\"page-break\">Section One</h2>",
			"  <p>Content...</p>",
			"  <h2 class=\"page-break\">Section Two</h2>",
			"  <p>Content...</p>",
			"</body>",
			"</html>",
		].join("\n");
	}, []);

	const getPrompt = useCallback((): string => {
		const hasLogo = logoImages.length > 0;
		const hasCover = coverImages.length > 0;
		
		// Generate the main prompt using the comprehensive template
		const mainPrompt = generateTemplatePrompt({
			templateName,
			hasLogo,
			hasCover,
			primaryColor: primaryColor.trim() || undefined,
			stylePreset,
			additionalNotes: additionalNotes.trim() || undefined,
			baseHtmlTemplate,
		});

		// Generate attachments section
		const attachmentsSection = generateAttachmentsSection(
			referenceReports,
			logoImages,
			coverImages,
			additionalRefs,
		);

		// Combine prompt with attachments
		return mainPrompt + "\n\n" + attachmentsSection;
	}, [templateName, referenceReports, logoImages, coverImages, additionalRefs, primaryColor, additionalNotes, baseHtmlTemplate, stylePreset]);

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

	return (
		<ScrollArea className="w-full space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-[85vh]">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-1">AI-Assisted Template Builder</h3>
				<p className="text-sm text-gray-600">Attach an existing report along with brand assets and we will draft a reusable HTML template for you.</p>
			</div>
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2 md:col-span-2">
						<Label className="text-sm font-medium text-gray-700">Template Name <span className="text-red-500">*</span></Label>
						<Input disabled={isPending}
							onChange={(e) => setTemplateName(e.target.value)}
							placeholder="e.g., Monthly Progress Report"
							value={templateName}
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Palette className="h-4 w-4 text-gray-600" /> Style Preset</Label>
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 text-sm">
								<input checked={stylePreset === "modern"}
									className="w-4 h-4"
									onChange={() => setStylePreset("modern")}
									type="radio"
								/> Modern
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input checked={stylePreset === "classic"}
									className="w-4 h-4"
									onChange={() => setStylePreset("classic")}
									type="radio"
								/> Classic
							</label>
						</div>
					</div>
				</div>
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-600" /> Existing Report(s) <span className="text-red-500">*</span></Label>
					<div className="flex gap-3 items-start">
						<div className="flex-shrink-0">{loadSectionDocumentPanel("reports", "Select reports (PDF/DOCX)")}</div>
						<div className="flex-1 space-y-2">
							{referenceReports.length > 0 ? referenceReports.map((doc) => (
								<div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200" key={doc.id}>
									<FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
									<span className="text-sm text-blue-900 truncate flex-1" title={doc.name}>{doc.name}</span>
									<Button className="h-6 w-6 p-0 hover:bg-blue-200"
										disabled={isPending}
										onClick={() => removeDocument("reports", doc.id)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-3 w-3 text-blue-600" />
									</Button>
								</div>
							)) : (
								<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">Attach one or more reports (PDF, DOCX, etc.)</div>
							)}
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-gray-600" /> Company Logo (optional)</Label>
						<div className="flex gap-3 items-start">
							<div className="flex-shrink-0">{loadSectionDocumentPanel("logo", "Select logo image")}</div>
							<div className="flex-1 space-y-2">
								{logoImages.length > 0 ? logoImages.map((doc) => (
									<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" key={doc.id}>
										<ImageIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
										<span className="text-sm text-gray-900 truncate flex-1" title={doc.name}>{doc.name}</span>
										<Button className="h-6 w-6 p-0"
											disabled={isPending}
											onClick={() => removeDocument("logo", doc.id)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<X className="h-3 w-3 text-gray-600" />
										</Button>
									</div>
								)) : (
									<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">Optional: attach a logo image</div>
								)}
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-gray-600" /> Cover Image (optional)</Label>
						<div className="flex gap-3 items-start">
							<div className="flex-shrink-0">{loadSectionDocumentPanel("cover", "Select cover image")}</div>
							<div className="flex-1 space-y-2">
								{coverImages.length > 0 ? coverImages.map((doc) => (
									<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" key={doc.id}>
										<ImageIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
										<span className="text-sm text-gray-900 truncate flex-1" title={doc.name}>{doc.name}</span>
										<Button className="h-6 w-6 p-0"
											disabled={isPending}
											onClick={() => removeDocument("cover", doc.id)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<X className="h-3 w-3 text-gray-600" />
										</Button>
									</div>
								)) : (
									<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">Optional: attach a cover background image</div>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-700">Additional references (optional)</Label>
					<div className="flex gap-3 items-start">
						<div className="flex-shrink-0">{loadSectionDocumentPanel("additional", "Select additional references")}</div>
						<div className="flex-1 space-y-2">
							{additionalRefs.length > 0 ? additionalRefs.map((doc) => (
								<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" key={doc.id}>
									<FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
									<span className="text-sm text-gray-900 truncate flex-1" title={doc.name}>{doc.name}</span>
									<Button className="h-6 w-6 p-0"
										disabled={isPending}
										onClick={() => removeDocument("additional", doc.id)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-3 w-3 text-gray-600" />
									</Button>
								</div>
							)) : (
								<div className="text-sm text-gray-500 italic p-3 border-2 border-dashed border-gray-200 rounded-md text-center">Optional: attach any other helpful references</div>
							)}
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Preferred Brand Primary (hex, optional)</Label>
						<Input disabled={isPending}
							onChange={(e) => setPrimaryColor(e.target.value)}
							placeholder="#3b82f6"
							value={primaryColor}
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
						<Textarea disabled={isPending}
							onChange={(e) => setAdditionalNotes(e.target.value)}
							placeholder="Anything specific about colors, typography, sections, or layout..."
							value={additionalNotes}
						/>
					</div>
				</div>
				{!isFormValid && templateName && (
					<div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">Attach at least one existing report (PDF/DOCX/etc.)</div>
				)}
			</div>
			<div className="flex justify-end pt-4 border-t border-gray-100">
				<Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6"
					disabled={isWaitingForResponse || !isFormValid}
					onClick={onSubmit}
				>
					{isWaitingForResponse ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Preparing prompt...</>) : (<>Start AI Template Draft <CornerDownLeft className="h-4 w-4 ml-2" /></>)}
				</Button>
			</div>
		</ScrollArea>
	);
}


