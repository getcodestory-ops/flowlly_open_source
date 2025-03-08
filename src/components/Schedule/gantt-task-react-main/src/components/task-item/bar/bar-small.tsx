import React from "react";
import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import { TaskItemProps } from "../task-item";
import styles from "./bar.module.css";

export const BarSmall: React.FC<TaskItemProps> = ({
	task,
	isProgressChangeable,
	isDateChangeable,
	onEventStart,
	isSelected,
}) => {
	const progressPoint = getProgressPoint(
		task.progressWidth + task.x1,
		task.y,
		task.height,
	);
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
