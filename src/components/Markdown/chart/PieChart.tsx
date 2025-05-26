import React, { useMemo, useCallback } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChartProps } from "./types";

const PieChart: React.FC<PieChartProps> = React.memo(({ title, elements }) => {
	// Memoize the data transformation
	const data = useMemo(() => 
		elements.map((element, index) => ({
			name: element.label,
			value: element.angle, // Using angle as the value
			angle: element.angle,
		})), [elements],
	);

	// Memoize total angle calculation
	const totalAngle = useMemo(() => 
		elements.reduce((sum, element) => sum + element.angle, 0), [elements],
	);

	// Generate colors for each slice (static, so no need to memoize)
	const colors = [
		"#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
		"#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6B7280",
	];

	// Memoize custom tooltip component
	const CustomTooltip = useCallback(({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0];
			const percentage = ((data.value / totalAngle) * 100).toFixed(1);
			
			return (
				<div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
					<p className="font-medium text-gray-900">{data.name}</p>
					<p className="text-sm text-gray-600">
						Angle: {data.value.toFixed(1)}°
					</p>
					<p className="text-sm text-gray-600">
						Percentage: {percentage}%
					</p>
				</div>
			);
		}
		return null;
	}, [totalAngle]);

	// Memoize label renderer function
	const renderLabel = useCallback((entry: any) => {
		const percentage = ((entry.value / totalAngle) * 100).toFixed(1);
		return `${percentage}%`;
	}, [totalAngle]);

	// Memoize legend formatter
	const legendFormatter = useCallback((value: any, entry: any) => (
		<span style={{ color: entry.color }}>
			{value}
		</span>
	), []);

	// Memoize cells to prevent re-creation on every render
	const cells = useMemo(() => 
		data.map((entry, index) => (
			<Cell 
				className="hover:opacity-80 transition-opacity cursor-pointer" 
				fill={colors[index % colors.length]}
				key={`cell-${index}`}
			/>
		)), [data, colors],
	);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 my-4 max-w-2xl">
			<h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
			<div className="w-full h-96">
				<ResponsiveContainer height="100%" width="100%">
					<RechartsPieChart>
						<Pie
							cx="50%"
							cy="50%"
							data={data}
							dataKey="value"
							fill="#8884d8"
							label={renderLabel}
							labelLine={false}
							outerRadius={80}
						>
							{cells}
						</Pie>
						<Tooltip content={CustomTooltip} />
						<Legend 
							formatter={legendFormatter}
							height={36}
							verticalAlign="bottom"
						/>
					</RechartsPieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
});

// Add display name for better debugging
PieChart.displayName = "PieChart";

export default PieChart; 