import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LineChartProps } from "./types";

const LineChart: React.FC<LineChartProps> = React.memo(({
	title,
	elements,
	x_label,
	y_label,
	x_ticks,
	y_ticks,
	x_tick_labels,
	y_tick_labels,
}) => {
	// Colors for multiple lines
	const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4"];

	// Transform data for Recharts format
	const chartData = useMemo(() => {
		// Get all unique x values from all elements
		const allXValues = new Set<number>();
		elements.forEach((element) => {
			element.points.forEach((point) => allXValues.add(point[0]));
		});
		
		// Sort x values
		const sortedXValues = Array.from(allXValues).sort((a, b) => a - b);
		
		// Create data points for each x value
		return sortedXValues.map((xValue) => {
			const dataPoint: any = { x: xValue };
			
			// Add y values for each line element
			elements.forEach((element, index) => {
				const point = element.points.find((p) => p[0] === xValue);
				dataPoint[`line${index}`] = point ? point[1] : null;
			});
			
			return dataPoint;
		});
	}, [elements]);

	// Custom tooltip formatter
	const CustomTooltip = useMemo(() => {
		const TooltipComponent = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
						<p className="text-sm font-medium text-gray-900">{`${x_label || "X"}: ${label}`}</p>
						{payload.map((entry: any, index: number) => (
							<p className="text-sm"
								key={index}
								style={{ color: entry.color }}
							>
								{`${elements[index]?.label || `Line ${index + 1}`}: ${entry.value}`}
							</p>
						))}
					</div>
				);
			}
			return null;
		};
		
		TooltipComponent.displayName = "CustomTooltip";
		return TooltipComponent;
	}, [elements, x_label]);

	// Custom label formatter for X-axis
	const formatXAxisLabel = useMemo(() => (value: any, index: number) => {
		if (x_tick_labels && x_tick_labels[index]) {
			return x_tick_labels[index];
		}
		return value;
	}, [x_tick_labels]);

	// Custom label formatter for Y-axis
	const formatYAxisLabel = useMemo(() => (value: any, index: number) => {
		if (y_tick_labels && y_tick_labels[index]) {
			return y_tick_labels[index];
		}
		return value;
	}, [y_tick_labels]);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 my-4 max-w-4xl">
			<h3 className="text-lg font-semibold mb-4 text-center text-gray-800">{title}</h3>
			<div className="w-full h-80">
				<ResponsiveContainer height="100%" width="100%">
					<RechartsLineChart
						data={chartData}
						margin={{
							top: 20,
							right: 30,
							left: 20,
							bottom: 60,
						}}
					>
						<CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
						<XAxis 
							dataKey="x"
							domain={x_ticks ? [x_ticks[0], x_ticks[x_ticks.length - 1]] : ["dataMin", "dataMax"]}
							label={{ 
								value: x_label || "", 
								position: "insideBottom", 
								offset: -10,
								style: { textAnchor: "middle", fontSize: "12px", fill: "#374151" },
							}}
							tick={{ fontSize: 12, fill: "#374151" }}
							tickFormatter={formatXAxisLabel}
						/>
						<YAxis 
							domain={y_ticks ? [y_ticks[0], y_ticks[y_ticks.length - 1]] : ["dataMin", "dataMax"]}
							label={{ 
								value: y_label || "", 
								angle: -90, 
								position: "insideLeft",
								style: { textAnchor: "middle", fontSize: "12px", fill: "#374151" },
							}}
							tick={{ fontSize: 12, fill: "#374151" }}
							tickFormatter={formatYAxisLabel}
						/>
						<Tooltip content={CustomTooltip} />
						{elements.length > 1 && (
							<Legend 
								iconType="line"
								wrapperStyle={{ paddingTop: "20px" }}
							/>
						)}
						{elements.map((element, index) => (
							<Line
								activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
								animationDuration={800}
								animationEasing="ease-in-out"
								connectNulls={false}
								dataKey={`line${index}`}
								dot={{ fill: colors[index % colors.length], strokeWidth: 1, r: 4 }}
								key={`line-${index}`}
								name={element.label || `Line ${index + 1}`}
								stroke={colors[index % colors.length]}
								strokeWidth={2}
								type="monotone"
							/>
						))}
					</RechartsLineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
});

// Add PropTypes validation
LineChart.propTypes = {
	title: PropTypes.string.isRequired,
	elements: PropTypes.array.isRequired,
	x_label: PropTypes.string,
	y_label: PropTypes.string,
	x_ticks: PropTypes.array,
	y_ticks: PropTypes.array,
	x_tick_labels: PropTypes.array,
	y_tick_labels: PropTypes.array,
};

// Add display name for better debugging
LineChart.displayName = "LineChart";

export default LineChart; 