import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
	const barColor = isSelected
		? task.styles.backgroundSelectedColor
		: task.styles.backgroundColor;
	const processColor = isSelected
		? task.styles.progressSelectedColor
		: task.styles.progressColor;
	const projectWith = task.x2 - task.x1;

	const projectLeftTriangle = [
		task.x1,
		task.y + task.height / 2 - 1,
		task.x1,
		task.y + task.height,
		task.x1 + 15,
		task.y + task.height / 2 - 1,
	].join(",");
	const projectRightTriangle = [
		task.x2,
		task.y + task.height / 2 - 1,
		task.x2,
		task.y + task.height,
		task.x2 - 15,
		task.y + task.height / 2 - 1,
	].join(",");

	return (
		<g className={styles.projectWrapper} tabIndex={0}>
			<rect
				className={styles.projectBackground}
				fill={barColor}
				height={task.height}
				rx={task.barCornerRadius}
				ry={task.barCornerRadius}
				width={projectWith}
				x={task.x1}
				y={task.y}
			/>
			<rect
				fill={processColor}
				height={task.height}
				rx={task.barCornerRadius}
				ry={task.barCornerRadius}
				width={task.progressWidth}
				x={task.progressX}
				y={task.y}
			/>
			<rect
				className={styles.projectTop}
				fill={barColor}
				height={task.height / 2}
				rx={task.barCornerRadius}
				ry={task.barCornerRadius}
				width={projectWith}
				x={task.x1}
				y={task.y}
			/>
			<polygon
				className={styles.projectTop}
				fill={barColor}
				points={projectLeftTriangle}
			/>
			<polygon
				className={styles.projectTop}
				fill={barColor}
				points={projectRightTriangle}
			/>
		</g>
	);
};
