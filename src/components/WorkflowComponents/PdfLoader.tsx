import React, { useState } from "react";
import { Button } from "@/components/ui/button";
export interface Drawing {
  url: string;
  filename: string;
  mimeType: string;
}

interface PdfLoaderProps {
  drawings: Drawing[];
}

const PdfLoader: React.FC<PdfLoaderProps> = ({ drawings }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	if (!drawings || drawings.length === 0) {
		return <div>No drawings available.</div>;
	}

	const selectedDrawing =
    selectedIndex !== null ? drawings[selectedIndex] : null;

	return (
		<div>
			{/* List of buttons for each drawing */}
			<div className="mb-4 flex flex-wrap gap-2">
				{drawings.map((drawing, index) => (
					<Button
						className="flex items-center gap-2"
						key={index}
						onClick={() => setSelectedIndex(index)}
						variant="outline"
					>
						<svg
							fill="none"
							height="16"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							width="16"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line
								x1="12"
								x2="12"
								y1="18"
								y2="12"
							/>
							<line
								x1="9"
								x2="15"
								y1="15"
								y2="15"
							/>
						</svg>
            Load {drawing.filename}
					</Button>
				))}
			</div>
			{/* Pdf viewer using an iframe */}
			{selectedDrawing && (
				<div className="border rounded-lg overflow-hidden">
					<iframe
						frameBorder="0"
						src={selectedDrawing.url}
						style={{ width: "100%", height: "600px" }}
						title={selectedDrawing.filename}
					/>
				</div>
			)}
		</div>
	);
};

export default PdfLoader;
