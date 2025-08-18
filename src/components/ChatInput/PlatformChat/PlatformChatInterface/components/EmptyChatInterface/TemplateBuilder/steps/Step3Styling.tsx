import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
	brandColor: string;
	textColor: string;
	headerBgColor: string;
	onChange: (updates: Partial<{ brandColor: string; textColor: string; headerBgColor: string }>) => void;
}

export default function Step3Styling({ brandColor, textColor, headerBgColor, onChange }: Props): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div className="mb-8">
				<h3 className="text-2xl font-bold text-gray-900 mb-2">Styling & Colors</h3>
				<p className="text-gray-600">Customize the visual appearance of your template with brand colors and styling preferences.</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<Label className="text-base font-medium">Brand Color</Label>
					<div className="flex gap-2 mt-2">
						<Input className="w-16 h-10 p-1"
							onChange={(e) => onChange({ brandColor: e.target.value })}
							type="color"
							value={brandColor}
						/>
						<Input className="flex-1"
							onChange={(e) => onChange({ brandColor: e.target.value })}
							placeholder="#3b82f6"
							value={brandColor}
						/>
					</div>
				</div>
				<div>
					<Label className="text-base font-medium">Text Color</Label>
					<div className="flex gap-2 mt-2">
						<Input className="w-16 h-10 p-1"
							onChange={(e) => onChange({ textColor: e.target.value })}
							type="color"
							value={textColor}
						/>
						<Input className="flex-1"
							onChange={(e) => onChange({ textColor: e.target.value })}
							placeholder="#0f172a"
							value={textColor}
						/>
					</div>
				</div>
				<div>
					<Label className="text-base font-medium">Header Background</Label>
					<div className="flex gap-2 mt-2">
						<Input className="w-16 h-10 p-1"
							onChange={(e) => onChange({ headerBgColor: e.target.value })}
							type="color"
							value={headerBgColor}
						/>
						<Input className="flex-1"
							onChange={(e) => onChange({ headerBgColor: e.target.value })}
							placeholder="#ffffff"
							value={headerBgColor}
						/>
					</div>
				</div>
			</div>
			<div className="p-4 border rounded-lg bg-gray-50">
				<p className="text-sm text-gray-600 mb-2">🎨 <strong>Preview Colors:</strong></p>
				<div className="flex gap-4 items-center">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded" style={{ backgroundColor: brandColor }} />
						<span className="text-sm">Brand</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded" style={{ backgroundColor: textColor }} />
						<span className="text-sm">Text</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded border" style={{ backgroundColor: headerBgColor }} />
						<span className="text-sm">Header BG</span>
					</div>
				</div>
			</div>
		</div>
	);
}


