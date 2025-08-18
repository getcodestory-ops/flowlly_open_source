import React from "react";
import MarginBoxInterface, { type MarginBoxConfig } from "../../MarginBoxInterface";

interface Props {
	marginBoxes: Record<string, MarginBoxConfig>;
	selectedMarginBox: string | null;
	onMarginBoxSelect: (boxName: string) => void;
	onMarginBoxUpdate: (boxName: string, updates: Partial<MarginBoxConfig>) => void;
}

export default function Step4MarginBoxes({ marginBoxes, selectedMarginBox, onMarginBoxSelect, onMarginBoxUpdate }: Props): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div className="mb-8">
				<h3 className="text-2xl font-bold text-gray-900 mb-2">Headers & Footers</h3>
				<p className="text-gray-600">Configure page margin boxes for headers, footers, and page elements. Click on any margin box to configure it.</p>
			</div>
			<MarginBoxInterface
				marginBoxes={marginBoxes}
				onMarginBoxSelect={onMarginBoxSelect}
				onMarginBoxUpdate={onMarginBoxUpdate}
				selectedMarginBox={selectedMarginBox}
			/>
		</div>
	);
}


