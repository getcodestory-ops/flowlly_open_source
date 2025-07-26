import { NodeViewWrapper } from "@tiptap/react";
import React, { useMemo } from "react";
import ChartComponent from "@/components/Markdown/chart/ChartComponent";

export const ChartDisplay = (props: any) => {
	const chartData = props.node.attrs.data || "{}";
	
	// Tiptap v3: Handle potential undefined getPos
	const pos = props.getPos?.();
	
	// Use useMemo to render the component only when chartData changes
	const renderedComponent = useMemo(() => {
		// Check if we have valid chart data
		if (!chartData || chartData === "{}") {
			return (
				<div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-4">
					<p className="text-gray-600 text-center">No chart data available</p>
				</div>
			);
		}

		try {
			// Validate that the data is valid JSON
			JSON.parse(chartData);
			return <ChartComponent data={chartData} />;
		} catch (error) {
			console.error("Invalid chart data:", error);
			return (
				<div className="bg-red-100 border border-red-200 rounded-lg p-4 my-4">
					<p className="text-red-700 font-semibold">Error parsing chart data</p>
					<p className="text-red-600 text-sm mt-1">
						Please check that the JSON data is properly formatted.
					</p>
					<pre className="text-xs mt-2 text-red-500 bg-red-50 p-2 rounded">
						{chartData}
					</pre>
				</div>
			);
		}
	}, [chartData]);

	return (
		<NodeViewWrapper className="chart">
			{renderedComponent}
		</NodeViewWrapper>
	);
};

export default ChartDisplay;
