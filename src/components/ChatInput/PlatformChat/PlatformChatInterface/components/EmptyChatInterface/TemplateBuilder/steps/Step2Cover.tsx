import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CoverPageDesigner, { type CoverElement } from "../../CoverPageDesigner";

interface Props {
	includeCover: boolean;
	coverDesignMode: "simple" | "advanced";
	coverTitle: string;
	coverSubtitle: string;
	coverLogoUrl: string;
	preparedFor: string;
	preparedBy: string;
	dateText: string;
	coverElements: CoverElement[];
	onChange: (updates: Partial<{
		includeCover: boolean;
		coverDesignMode: "simple" | "advanced";
		coverTitle: string;
		coverSubtitle: string;
		coverLogoUrl: string;
		preparedFor: string;
		preparedBy: string;
		dateText: string;
		coverElements: CoverElement[];
	}>) => void;
}

export default function Step2Cover(props: Props): React.JSX.Element {
	const { includeCover } = props;

	return (
		<div className="space-y-6">
			{/* Checkbox and Cover Page */}
			<div className="flex items-center space-x-2">
				<Checkbox 
					checked={includeCover} 
					id="includeCover" 
					onCheckedChange={(v) => props.onChange({ includeCover: Boolean(v) })} 
				/>
				<Label className="text-2xl text-2xl font-bold text-gray-900" htmlFor="includeCover">Cover Page</Label>
			</div>
			{includeCover && (
				<div className="-mx-8 px-8">
					<CoverPageDesigner
						coverLogoUrl={props.coverLogoUrl}
						coverSubtitle={props.coverSubtitle}
						coverTitle={props.coverTitle}
						dateText={props.dateText}
						elements={props.coverElements}
						onElementsChange={(els) => props.onChange({ coverElements: els })}
						onSimpleFormChange={(updates) => props.onChange(updates)}
						preparedBy={props.preparedBy}
						preparedFor={props.preparedFor}
					/>
				</div>
			)}
		</div>
	);
}

