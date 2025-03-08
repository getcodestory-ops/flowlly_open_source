import React from "react";
import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarDateHandle } from "./bar-date-handle";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemProps } from "../task-item";
import styles from "./bar.module.css";

export const Bar: React.FC<TaskItemProps> = ({
	task,
	isProgressChangeable,
	isDateChangeable,
	rtl,
	onEventStart,
	isSelected,
}) => {
	const progressPoint = getProgressPoint(
		+!rtl * task.progressWidth + task.progressX,
		task.y,
		task.height,
	);
	const handleHeight = task.height - 2;
	return (
		<g className={styles.barWrapper} tabIndex={0}>
			<BarDisplay
				barCornerRadius={task.barCornerRadius}
				height={task.height}
				isSelected={isSelected}
				onMouseDown={(e) => {
					isDateChangeable && onEventStart("move", task, e);
				}}
				progressWidth={task.progressWidth}
				progressX={task.progressX}
				styles={task.styles}
				width={task.x2 - task.x1}
				x={task.x1}
				y={task.y}
			/>
			<g className="handleGroup">
				{isDateChangeable && (
					<g>
						{/* left */}
						<BarDateHandle
							barCornerRadius={task.barCornerRadius}
							height={handleHeight}
							onMouseDown={(e) => {
								onEventStart("start", task, e);
							}}
							width={task.handleWidth}
							x={task.x1 + 1}
							y={task.y + 1}
						/>
						{/* right */}
						<BarDateHandle
							barCornerRadius={task.barCornerRadius}
							height={handleHeight}
							onMouseDown={(e) => {
								onEventStart("end", task, e);
							}}
							width={task.handleWidth}
							x={task.x2 - task.handleWidth - 1}
							y={task.y + 1}
						/>
					</g>
				)}
				{isProgressChangeable && (
					<BarProgressHandle
						onMouseDown={(e) => {
							onEventStart("progress", task, e);
						}}
						progressPoint={progressPoint}
					/>
				)}
			</g>
		</g>
	);
};
