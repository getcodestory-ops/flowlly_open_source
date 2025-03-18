import { NodeViewWrapper } from "@tiptap/react";
import React, { useMemo } from "react";
import { renderJsxString } from "@/utils/jsxStringRenderer";


const decodeBase64 = (base64String: string): string => {
	try {
		return atob(base64String);
	} catch (error) {
		console.error("Error decoding base64:", error);
		return "<p>Error decoding chart data</p>";
	}
};

export const ChartDisplay = (props: any) => {
	const chart_id = props.node.attrs.chart_id;
	const jsxEncoded = props.node.attrs.jsx || "<p>No chart data available</p>";

	// Use useMemo to render the component only when chart_id or jsx_string changes
	const renderedComponent = useMemo(() => {
		// Check if the jsx is base64 encoded and decode it if needed
		let jsxDecoded = jsxEncoded;
		
		
		// Simple check if the string looks like it's base64 encoded
		if (jsxEncoded.match(/^[A-Za-z0-9+/=]+$/)) {
			try {
				jsxDecoded = decodeBase64(jsxEncoded).replace("{/*", "")
					.replace("*/}", "");
			} catch (error) {
				console.error("Failed to decode JSX:", error);
			}
		}
		
		// Use our utility function to render the JSX string as a component
		const component = renderJsxString(jsxDecoded, chart_id);

		return component;
	}, [chart_id, jsxEncoded]);

	return (
		<NodeViewWrapper className="chart">
			{renderedComponent}
		</NodeViewWrapper>
	);
};

export default ChartDisplay;
