import React from "react";
import styles from "./calendar.module.css";

type TopPartOfCalendarProps = {
  value: string;
  x1Line: number;
  y1Line: number;
  y2Line: number;
  xText: number;
  yText: number;
};

export const TopPartOfCalendar: React.FC<TopPartOfCalendarProps> = ({
	value,
	x1Line,
	y1Line,
	y2Line,
	xText,
	yText,
}) => {
	return (
		<g className="calendarTop">
			<line
				className={styles.calendarTopTick}
				key={value + "line"}
				x1={x1Line}
				x2={x1Line}
				y1={y1Line}
				y2={y2Line}
			/>
			<text
				className={styles.calendarTopText}
				key={value + "text"}
				x={xText}
				y={yText}
			>
				{value}
			</text>
		</g>
	);
};
