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
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <line
            x1="0"
            y1="0"
            x2="6"
            y2="6"
            stroke={getBarColor()}
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect
        x={x}
        width={width}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={getBarColor()}
        className={style.barBackground}
      />

      {delayWidth > 0 && (
        <rect
          x={x + width}
          width={delayWidth}
          y={y}
          height={height}
          ry={barCornerRadius}
          rx={barCornerRadius}
          fill={`url(#${patternId})`}
          className={style.barBackground}
          stroke="red"
          strokeWidth="1"
          fillOpacity={0.8}
          style={{
            pointerEvents: "none",
            strokeDasharray: "2,2",
          }}
        />
      )}

      <rect
        x={progressX}
        width={progressWidth}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={getProcessColor()}
      />
    </g>
  );
};
