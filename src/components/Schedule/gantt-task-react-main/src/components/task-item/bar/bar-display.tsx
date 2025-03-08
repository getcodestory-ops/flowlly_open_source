import React from "react";
import style from "./bar.module.css";

type BarDisplayProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  styles: {
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
  };
  delayWidth?: number;
  onMouseDown: (event: React.MouseEvent<SVGPolygonElement, MouseEvent>) => void;
};

export const BarDisplay: React.FC<BarDisplayProps> = ({
	x,
	y,
	width,
	height,
	isSelected,
	progressX,
	progressWidth,
	barCornerRadius,
	styles,
	delayWidth = 0,
	onMouseDown,
}) => {
	const getProcessColor = () => {
		return isSelected ? styles.progressSelectedColor : styles.progressColor;
	};

	const getBarColor = () => {
		return isSelected ? styles.backgroundSelectedColor : styles.backgroundColor;
	};

	const patternId = `stripe-pattern-${x}-${y}`;

	return (
		<g onMouseDown={onMouseDown}>
			<defs>
				<pattern
					height="6"
					id={patternId}
					patternUnits="userSpaceOnUse"
					width="6"
				>
					<line
						stroke={getBarColor()}
						strokeWidth="1"
						x1="0"
						x2="6"
						y1="0"
						y2="6"
					/>
				</pattern>
			</defs>
			<rect
				className={style.barBackground}
				fill={getBarColor()}
				height={height}
				rx={barCornerRadius}
				ry={barCornerRadius}
				width={width}
				x={x}
				y={y}
			/>
			{delayWidth > 0 && (
				<rect
					className={style.barBackground}
					fill={`url(#${patternId})`}
					fillOpacity={0.8}
					height={height}
					rx={barCornerRadius}
					ry={barCornerRadius}
					stroke="red"
					strokeWidth="1"
					style={{
						pointerEvents: "none",
						strokeDasharray: "2,2",
					}}
					width={delayWidth}
					x={x + width}
					y={y}
				/>
			)}
			<rect
				fill={getProcessColor()}
				height={height}
				rx={barCornerRadius}
				ry={barCornerRadius}
				width={progressWidth}
				x={progressX}
				y={y}
			/>
		</g>
	);
};
