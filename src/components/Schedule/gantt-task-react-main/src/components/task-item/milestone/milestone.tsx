import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./milestone.module.css";

export const Milestone: React.FC<TaskItemProps> = ({
	task,
	isDateChangeable,
	onEventStart,
	isSelected,
}) => {
	const transform = `rotate(45 ${task.x1 + task.height * 0.356} 
    ${task.y + task.height * 0.85})`;
	const getBarColor = () => {
		return isSelected
			? task.styles.backgroundSelectedColor
			: task.styles.backgroundColor;
	};

	return (
		<g className={styles.milestoneWrapper} tabIndex={0}>
			<rect
				className={styles.milestoneBackground}
				fill={getBarColor()}
				height={task.height}
				onMouseDown={(e) => {
					isDateChangeable && onEventStart("move", task, e);
				}}
				rx={task.barCornerRadius}
				ry={task.barCornerRadius}
				transform={transform}
				width={task.height}
				x={task.x1}
				y={task.y}
			/>
		</g>
	);
};
