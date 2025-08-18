import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

interface Props {
	templateName: string;
	useCase: string;
	stylePreset: "modern" | "classic";
	onChange: (updates: Partial<{ templateName: string; useCase: string; stylePreset: "modern" | "classic" }>) => void;
}

export default function Step1BasicInfo({ templateName, useCase, stylePreset, onChange }: Props): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div className="mb-8">
				<h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
				<p className="text-gray-600">Set up the foundation for your template with name, use case, and style preferences.</p>
			</div>
			<div>
				<Label className="text-base font-medium">Template Name *</Label>
				<Input 
					className="mt-2"
					onChange={(e) => onChange({ templateName: e.target.value })} 
					placeholder="e.g., Daily Progress Report"
					value={templateName} 
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label className="text-base font-medium">Use Case</Label>
					<Input 
						className="mt-2"
						onChange={(e) => onChange({ useCase: e.target.value })} 
						placeholder="e.g., reports, analysis"
						value={useCase} 
					/>
				</div>
				<div>
					<Label className="text-base font-medium">Style Preset</Label>
					<Select onValueChange={(v: "modern" | "classic") => onChange({ stylePreset: v })} value={stylePreset}>
						<SelectTrigger className="mt-2">
							<SelectValue placeholder="Select style" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="modern">🎨 Modern (Sans-serif, clean)</SelectItem>
							<SelectItem value="classic">📜 Classic (Serif, traditional)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}


