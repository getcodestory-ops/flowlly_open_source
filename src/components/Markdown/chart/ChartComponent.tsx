import React from "react";
import PropTypes from "prop-types";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import { ChartData, PieChartData, LineChartData, ChartComponentProps } from "./types";

const ChartComponent: React.FC<ChartComponentProps> = React.memo(({ data }) => {
	try {
		const parsedData = JSON.parse(data);
		const { type, title, elements, x_label, y_label, x_unit, y_unit } = parsedData;
		
		switch (type.toLowerCase()) {
			case "bar":
				return (
					<BarChart
						elements={elements}
						title={title}
						x_label={x_label}
						x_unit={x_unit}
						y_label={y_label}
						y_unit={y_unit}
					/>
				);
			
			case "pie":
				// Check if the elements have angle property (new format) or value property (old format)
				const hasPieChartFormat = elements.length > 0 && "angle" in elements[0];
				
				if (hasPieChartFormat) {
					const pieData = parsedData as PieChartData;
					return (
						<PieChart
							elements={pieData.elements}
							title={pieData.title}
							x_label={pieData.x_label}
							y_label={pieData.y_label}
						/>
					);
				} else {
					// Convert value-based data to angle-based data for backward compatibility
					const total = elements.reduce((sum: number, el: any) => sum + el.value, 0);
					const convertedElements = elements.map((el: any) => ({
						label: el.label,
						angle: (el.value / total) * 360,
						radius: 1.0,
					}));
					
					return (
						<PieChart
							elements={convertedElements}
							title={title}
							x_label={x_label}
							y_label={y_label}
						/>
					);
				}
			
			case "line":
				// Check if the elements have points property (new format) or value property (old format)
				const hasLineChartFormat = elements.length > 0 && "points" in elements[0];
				
				if (hasLineChartFormat) {
					const lineData = parsedData as LineChartData;
					return (
						<LineChart
							elements={lineData.elements}
							title={lineData.title}
							x_label={lineData.x_label}
							x_scale={lineData.x_scale}
							x_tick_labels={lineData.x_tick_labels}
							x_ticks={lineData.x_ticks}
							x_unit={lineData.x_unit}
							y_label={lineData.y_label}
							y_scale={lineData.y_scale}
							y_tick_labels={lineData.y_tick_labels}
							y_ticks={lineData.y_ticks}
							y_unit={lineData.y_unit}
						/>
					);
				} else {
					// Convert simple label/value data to points format for backward compatibility
					const convertedElements = [{
						label: "Data",
						points: elements.map((el: any, index: number) => [index, el.value] as [number, number]),
					}];
					
					return (
						<LineChart
							elements={convertedElements}
							title={title}
							x_label={x_label}
							x_unit={x_unit}
							y_label={y_label}
							y_unit={y_unit}
						/>
					);
				}
			
			default:
				// Fallback for unsupported chart types
				return (
					<div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-4">
						<h3 className="text-lg font-semibold mb-2">{title}</h3>
						<p className="text-sm text-gray-600">
							Chart type &quot;{type}&quot; is not yet supported.
						</p>
						<p className="text-xs text-gray-500 mt-2">
							Supported types: bar, pie, line
						</p>
						<pre className="text-xs mt-2 text-gray-500 bg-gray-50 p-2 rounded">
							{JSON.stringify(parsedData, null, 2)}
						</pre>
					</div>
				);
		}
	} catch (error) {
		return (
			<div className="bg-red-100 border border-red-200 rounded-lg p-4 my-4">
				<p className="text-red-700 font-semibold">Error parsing chart data</p>
				<p className="text-red-600 text-sm mt-1">
					Please check that the JSON data is properly formatted.
				</p>
				<pre className="text-xs mt-2 text-red-500 bg-red-50 p-2 rounded">
					{data}
				</pre>
			</div>
		);
	}
});

// Add PropTypes validation
ChartComponent.propTypes = {
	data: PropTypes.string.isRequired,
};

// Add display name for better debugging
ChartComponent.displayName = "ChartComponent";

export default ChartComponent; 