import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Layout, Eye, Palette } from "lucide-react";
import type { StorageResourceEntity, CreateTemplateRequest } from "@/api/templateRoutes";
import { useCreateTemplate } from "@/hooks/useTemplates";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Cover from "./steps/Step2Cover";
import Step3Styling from "./steps/Step3Styling";
import Step4MarginBoxes from "./steps/Step4MarginBoxes";
import Step5Content from "./steps/Step5Content";
import Step6Preview from "./steps/Step6Preview";
import { useTemplateBuilderState } from "./useTemplateBuilderState";
import { buildCompleteTemplate } from "./builderUtils";

interface Props {
	onCreated: (template: StorageResourceEntity) => void;
}

export default function TemplateBuilderRoot({ onCreated }: Props): React.JSX.Element {
	const createTemplate = useCreateTemplate();
	const [state, setState] = useTemplateBuilderState();

	const steps = [
		{ id: 1, title: "Basic Info", icon: FileText },
		{ id: 2, title: "Cover Page", icon: Layout },
		{ id: 3, title: "Styling", icon: Palette },
		{ id: 4, title: "Headers & Footers", icon: Layout },
		{ id: 5, title: "Content", icon: Layout },
		{ id: 6, title: "Preview", icon: Eye },
	];

	const initialEditorContent = `
		<h1>Executive Summary</h1>
		<p>Provide a brief overview of the report objectives and key findings.</p>
		<h2>Project Overview</h2>
		<p>Describe the project scope, timeline, and major milestones.</p>
		<h2>Key Findings</h2>
		<p>Highlight the most important discoveries or results.</p>
		<h2>Recommendations</h2>
		<p>Outline actionable next steps based on the findings.</p>
	`;

	const handleSubmit = async(): Promise<void> => {
		const templateResult = buildCompleteTemplate({
			stylePreset: state.stylePreset,
			brandColor: state.brandColor,
			textColor: state.textColor,
			headerBgColor: state.headerBgColor,
			marginBoxes: state.marginBoxes as any,
			includeCover: state.includeCover,
			coverDesignMode: state.coverDesignMode,
			coverElements: state.coverElements,
			coverFields: {
				dateText: state.dateText,
				fallbackTitle: state.templateName,
				logo: state.coverLogoUrl,
				preparedBy: state.preparedBy,
				preparedFor: state.preparedFor,
				subtitle: state.coverSubtitle,
				title: state.coverTitle,
			},
			editorHtml: state.editorHtml || initialEditorContent,
		});

		const payload: CreateTemplateRequest = {
			template_name: state.templateName || "Untitled Template",
			use_case: state.useCase || "general",
			style: templateResult.style,
			headers: templateResult.headers,
			content: templateResult.content,
		};
		await createTemplate.mutateAsync(payload, { onSuccess: onCreated });
	};

	const renderStep = (id: number): React.ReactNode => {
		switch (id) {
			case 1:
				return (
					<Step1BasicInfo
						onChange={(u) => setState((s) => ({ ...s, ...u }))}
						stylePreset={state.stylePreset}
						templateName={state.templateName}
						useCase={state.useCase}
					/>
				);
			case 2:
				return (
					<Step2Cover
						coverDesignMode={state.coverDesignMode}
						coverElements={state.coverElements}
						coverLogoUrl={state.coverLogoUrl}
						coverSubtitle={state.coverSubtitle}
						coverTitle={state.coverTitle}
						dateText={state.dateText}
						includeCover={state.includeCover}
						onChange={(u) => setState((s) => ({ ...s, ...u }))}
						preparedBy={state.preparedBy}
						preparedFor={state.preparedFor}
					/>
				);
			case 3:
				return (
					<Step3Styling
						brandColor={state.brandColor}
						headerBgColor={state.headerBgColor}
						onChange={(u) => setState((s) => ({ ...s, ...u }))}
						textColor={state.textColor}
					/>
				);
			case 4:
				return (
					<Step4MarginBoxes
						marginBoxes={state.marginBoxes as any}
						onMarginBoxSelect={(name) => setState((s) => ({ ...s, selectedMarginBox: name }))}
						onMarginBoxUpdate={(name, updates) => setState((s) => ({ ...s, marginBoxes: { ...s.marginBoxes, [name]: { ...s.marginBoxes[name], ...updates } } }))}
						selectedMarginBox={state.selectedMarginBox}
					/>
				);
			case 5:
				return (
					<Step5Content
						editorHtml={state.editorHtml}
						initialContent={initialEditorContent}
						onChange={(html) => setState((s) => ({ ...s, editorHtml: html }))}
					/>
				);
			case 6: {
				const templateResult = buildCompleteTemplate({
					stylePreset: state.stylePreset,
					brandColor: state.brandColor,
					textColor: state.textColor,
					headerBgColor: state.headerBgColor,
					marginBoxes: state.marginBoxes as any,
					includeCover: state.includeCover,
					coverDesignMode: state.coverDesignMode,
					coverElements: state.coverElements,
					coverFields: {
						dateText: state.dateText,
						fallbackTitle: state.templateName,
						logo: state.coverLogoUrl,
						preparedBy: state.preparedBy,
						preparedFor: state.preparedFor,
						subtitle: state.coverSubtitle,
						title: state.coverTitle,
					},
					editorHtml: state.editorHtml || initialEditorContent,
				});
				return (
					<Step6Preview 
						content={templateResult.content}
						headers={templateResult.headers}
						style={templateResult.style}
					/>
				);
			}
			default:
				return null;
		}
	};

	return (
		<div className="w-[90vw] border-gray-200 h-[90vh] bg-white rounded-lg  overflow-hidden flex flex-col">
			{createTemplate.isPending && (
				<div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
					<div className="flex items-center gap-3 text-gray-700 bg-white p-6 rounded-lg shadow-lg">
						<Loader2 className="h-6 w-6 animate-spin text-blue-600" />
						<span className="font-medium">Creating your template...</span>
					</div>
				</div>
			)}
			<div className="flex-1 flex flex-col overflow-hidden">
				<div className="flex-1 overflow-hidden relative">
					<div className="w-full h-full overflow-y-auto p-8 flex-shrink-0">{renderStep(state.activeStep)}</div>
				</div>
			</div>
			<div className=" px-8 py-2 flex-shrink-0">
				<div className="flex justify-between items-center">
					<Button className=" disabled:opacity-50 disabled:cursor-not-allowed transition-colors border text-gray-700 font-medium"
						disabled={state.activeStep === 1}
						onClick={() => setState((s) => ({ ...s, activeStep: Math.max(1, s.activeStep - 1) }))}
					>Previous</Button>
					<div className="text-sm text-gray-500">{state.activeStep} / {steps.length}</div>
					{state.activeStep < 6 ? (
						<Button className="disabled:opacity-50 disabled:cursor-not-allowed  font-medium"
							disabled={state.activeStep === 1 && !state.templateName.trim()}
							onClick={() => setState((s) => ({ ...s, activeStep: Math.min(6, s.activeStep + 1) }))}
						>Next</Button>
					) : (
						<Button className="disabled:opacity-50 disabled:cursor-not-allowed "
							disabled={createTemplate.isPending || !state.templateName.trim()}
							onClick={handleSubmit}
						>
							{createTemplate.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating...</>) : (<><FileText className="h-4 w-4" />Create Template</>)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}


