import React, { ReactNode } from "react";
import { Task } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
};
export const GridBody: React.FC<GridBodyProps> = ({
	tasks,
	dates,
	rowHeight,
	svgWidth,
	columnWidth,
	todayColor,
	rtl,
}) => {
	let y = 0;
	const gridRows: ReactNode[] = [];
	const rowLines: ReactNode[] = [
		<line
			className={styles.gridRowLine}
			key="RowLineFirst"
			x="0"
			x2={svgWidth}
			y1={0}
			y2={0}
		/>,
	];
	for (const task of tasks) {
		gridRows.push(
			<rect
				className={styles.gridRow}
				height={rowHeight}
				key={"Row" + task.id}
				width={svgWidth}
				x="0"
				y={y}
			/>,
		);
		rowLines.push(
			<line
				className={styles.gridRowLine}
				key={"RowLine" + task.id}
				x="0"
				x2={svgWidth}
				y1={y + rowHeight}
				y2={y + rowHeight}
			/>,
		);
		y += rowHeight;
	}

	const now = new Date();
	let tickX = 0;
	const ticks: ReactNode[] = [];
	let today: ReactNode = <rect />;
	for (let i = 0; i < dates.length; i++) {
		const date = dates[i];
		ticks.push(
			<line
				className={styles.gridTick}
				key={date.getTime()}
				x1={tickX}
				x2={tickX}
				y1={0}
				y2={y}
			/>,
		);
		if (
			(i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
        	date,
        	date.getTime() - dates[i - 1].getTime(),
        	"millisecond",
        ).getTime() >= now.getTime())
		) {
			today = (
				<rect
					fill={todayColor}
					height={y}
					width={columnWidth}
					x={tickX}
					y={0}
				/>
			);
		}
		// rtl for today
		if (
			rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
		) {
			today = (
				<rect
					fill={todayColor}
					height={y}
					width={columnWidth}
					x={tickX + columnWidth}
					y={0}
				/>
			);
		}
		tickX += columnWidth;
	}
	return (
		<g className="gridBody">
			<g className="rows">{gridRows}</g>
			<g className="rowLines">{rowLines}</g>
			<g className="ticks">{ticks}</g>
			<g className="today">{today}</g>
		</g>
	);
};
