import React, { SyntheticEvent, useRef, useEffect } from "react";
import styles from "./horizontal-scroll.module.css";

export const HorizontalScroll: React.FC<{
  scroll: number;
  svgWidth: number;
  taskListWidth: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({ scroll, svgWidth, taskListWidth, rtl, onScroll }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scroll;
		}
	}, [scroll]);

	return (
		<div
			className={styles.scrollWrapper}
			dir="ltr"
			onScroll={onScroll}
			ref={scrollRef}
			style={{
				margin: rtl
					? `0px ${taskListWidth}px 0px 0px`
					: `0px 0px 0px ${taskListWidth}px`,
			}}
		>
			<div className={styles.scroll} style={{ width: svgWidth }} />
		</div>
	);
};
