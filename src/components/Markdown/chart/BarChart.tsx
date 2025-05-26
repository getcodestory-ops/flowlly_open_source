import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BaseChartProps } from "./types";

const BarChart: React.FC<BaseChartProps> = React.memo(({
	title,
	elements,
	x_label,
	y_label,
}) => {
	// Transform data for Recharts format
	const chartData = useMemo(() => {
		return elements.map((element) => ({
			name: element.label,
			value: element.value,
		}));
	}, [elements]);

	// Custom tooltip formatter
	const CustomTooltip = useMemo(() => {
		const TooltipComponent = ({ active, payload, label }: any) => {
			if (active && payload && payload.length) {
				return (
					<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
						<p className="text-sm font-medium text-gray-900">{`${x_label || "Category"}: ${label}`}</p>
						<p className="text-sm" style={{ color: payload[0].color }}>
							{`${y_label || "Value"}: ${payload[0].value}`}
						</p>
					</div>
				);
			}
			return null;
		};
		
		TooltipComponent.displayName = "CustomTooltip";
		return TooltipComponent;
	}, [x_label, y_label]);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 my-4 max-w-4xl">
			<h3 className="text-lg font-semibold mb-4 text-center text-gray-800">{title}</h3>
			<div className="w-full h-80">
				<ResponsiveContainer height="100%" width="100%">
					<RechartsBarChart
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
							angle={-45}
							dataKey="name"
							height={80}
							label={{ 
								value: x_label || "", 
								position: "insideBottom", 
								offset: -10,
								style: { textAnchor: "middle", fontSize: "12px", fill: "#374151" },
							}}
							textAnchor="end"
							tick={{ fontSize: 12, fill: "#374151" }}
						/>
						<YAxis 
							label={{ 
								value: y_label || "", 
								angle: -90, 
								position: "insideLeft",
								style: { textAnchor: "middle", fontSize: "12px", fill: "#374151" },
							}}
							tick={{ fontSize: 12, fill: "#374151" }}
						/>
						<Tooltip content={CustomTooltip} />
						<Bar 
							animationDuration={800} 
							animationEasing="ease-in-out"
							dataKey="value"
							fill="#3B82F6"
							radius={[4, 4, 0, 0]}
						/>
					</RechartsBarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
});

// Add PropTypes validation
BarChart.propTypes = {
	title: PropTypes.string.isRequired,
	elements: PropTypes.array.isRequired,
	x_label: PropTypes.string,
	y_label: PropTypes.string,
};

// Add display name for better debugging
BarChart.displayName = "BarChart";

export default BarChart; 