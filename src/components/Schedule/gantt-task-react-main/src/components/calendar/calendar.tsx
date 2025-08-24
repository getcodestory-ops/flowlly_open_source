import React, { ReactNode } from "react";
import { ViewMode } from "../../types/public-types";
import { TopPartOfCalendar } from "./top-part-of-calendar";
import {
	getCachedDateTimeFormat,
	getDaysInMonth,
	getLocalDayOfWeek,
	getLocaleMonth,
	getWeekNumberISO8601,
} from "../../helpers/date-helper";
import { DateSetup } from "../../types/date-setup";
import styles from "./calendar.module.css";

export type CalendarProps = {
  dateSetup: DateSetup;
  locale: string;
  viewMode: ViewMode;
  rtl: boolean;
  headerHeight: number;
  columnWidth: number;
  fontFamily: string;
  fontSize: string;
};

export const Calendar: React.FC<CalendarProps> = ({
	dateSetup,
	locale,
	viewMode,
	rtl,
	headerHeight,
	columnWidth,
	fontFamily,
	fontSize,
}) => {
	const getCalendarValuesForYear = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const topDefaultHeight = headerHeight * 0.5;
		for (let i = 0; i < dateSetup.dates.length; i++) {
			const date = dateSetup.dates[i];
			const bottomValue = date.getFullYear();
			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					key={date.getTime()}
					x={columnWidth * i + columnWidth * 0.5}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);
			if (
				i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
			) {
				const topValue = date.getFullYear().toString();
				let xText: number;
				if (rtl) {
					xText = (6 + i + date.getFullYear() + 1) * columnWidth;
				} else {
					xText = (6 + i - date.getFullYear()) * columnWidth;
				}
				topValues.push(
					<TopPartOfCalendar
						key={topValue}
						value={topValue}
						x1Line={columnWidth * i}
						xText={xText}
						y1Line={0}
						y2Line={headerHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}
		return [topValues, bottomValues];
	};

	const getCalendarValuesForQuarterYear = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const topDefaultHeight = headerHeight * 0.5;
		for (let i = 0; i < dateSetup.dates.length; i++) {
			const date = dateSetup.dates[i];
			// const bottomValue = getLocaleMonth(date, locale);
			const quarter = "Q" + Math.floor((date.getMonth() + 3) / 3);
			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					key={date.getTime()}
					x={columnWidth * i + columnWidth * 0.5}
					y={headerHeight * 0.8}
				>
					{quarter}
				</text>,
			);
			if (
				i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
			) {
				const topValue = date.getFullYear().toString();
				let xText: number;
				if (rtl) {
					xText = (6 + i + date.getMonth() + 1) * columnWidth;
				} else {
					xText = (6 + i - date.getMonth()) * columnWidth;
				}
				topValues.push(
					<TopPartOfCalendar
						key={topValue}
						value={topValue}
						x1Line={columnWidth * i}
						xText={Math.abs(xText)}
						y1Line={0}
						y2Line={topDefaultHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}
		return [topValues, bottomValues];
	};

	const getCalendarValuesForMonth = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const topDefaultHeight = headerHeight * 0.5;
		for (let i = 0; i < dateSetup.dates.length; i++) {
			const date = dateSetup.dates[i];
			const bottomValue = getLocaleMonth(date, locale);
			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					key={bottomValue + date.getFullYear()}
					x={columnWidth * i + columnWidth * 0.5}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);
			if (
				i === 0 ||
        date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()
			) {
				const topValue = date.getFullYear().toString();
				let xText: number;
				if (rtl) {
					xText = (6 + i + date.getMonth() + 1) * columnWidth;
				} else {
					xText = (6 + i - date.getMonth()) * columnWidth;
				}
				topValues.push(
					<TopPartOfCalendar
						key={topValue}
						value={topValue}
						x1Line={columnWidth * i}
						xText={xText}
						y1Line={0}
						y2Line={topDefaultHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}
		return [topValues, bottomValues];
	};

	const getCalendarValuesForWeek = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		let weeksCount: number = 1;
		const topDefaultHeight = headerHeight * 0.5;
		const dates = dateSetup.dates;
		for (let i = dates.length - 1; i >= 0; i--) {
			const date = dates[i];
			let topValue = "";
			if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
				// top
				topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
			}
			// bottom
			const bottomValue = `W${getWeekNumberISO8601(date)}`;

			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					key={date.getTime()}
					x={columnWidth * (i + +rtl)}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);

			if (topValue) {
				// if last day is new month
				if (i !== dates.length - 1) {
					topValues.push(
						<TopPartOfCalendar
							key={topValue}
							value={topValue}
							x1Line={columnWidth * i + weeksCount * columnWidth}
							xText={columnWidth * i + columnWidth * weeksCount * 0.5}
							y1Line={0}
							y2Line={topDefaultHeight}
							yText={topDefaultHeight * 0.9}
						/>,
					);
				}
				weeksCount = 0;
			}
			weeksCount++;
		}
		return [topValues, bottomValues];
	};

	const getCalendarValuesForDay = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const topDefaultHeight = headerHeight * 0.5;
		const dates = dateSetup.dates;
		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const bottomValue = `${getLocalDayOfWeek(date, locale, "short")}, ${date
				.getDate()
				.toString()}`;

			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					key={date.getTime()}
					x={columnWidth * i + columnWidth * 0.5}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);
			if (
				i + 1 !== dates.length &&
        date.getMonth() !== dates[i + 1].getMonth()
			) {
				const topValue = getLocaleMonth(date, locale);

				topValues.push(
					<TopPartOfCalendar
						key={topValue + date.getFullYear()}
						value={topValue}
						x1Line={columnWidth * (i + 1)}
						xText={
							columnWidth * (i + 1) -
              getDaysInMonth(date.getMonth(), date.getFullYear()) *
                columnWidth *
                0.5
						}
						y1Line={0}
						y2Line={topDefaultHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}
		return [topValues, bottomValues];
	};

	const getCalendarValuesForPartOfDay = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const ticks = viewMode === ViewMode.HalfDay ? 2 : 4;
		const topDefaultHeight = headerHeight * 0.5;
		const dates = dateSetup.dates;
		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const bottomValue = getCachedDateTimeFormat(locale, {
				hour: "numeric",
			}).format(date);

			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					fontFamily={fontFamily}
					key={date.getTime()}
					x={columnWidth * (i + +rtl)}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);
			if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
				const topValue = `${getLocalDayOfWeek(
					date,
					locale,
					"short",
				)}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
				topValues.push(
					<TopPartOfCalendar
						key={topValue + date.getFullYear()}
						value={topValue}
						x1Line={columnWidth * i + ticks * columnWidth}
						xText={columnWidth * i + ticks * columnWidth * 0.5}
						y1Line={0}
						y2Line={topDefaultHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}

		return [topValues, bottomValues];
	};

	const getCalendarValuesForHour = () => {
		const topValues: ReactNode[] = [];
		const bottomValues: ReactNode[] = [];
		const topDefaultHeight = headerHeight * 0.5;
		const dates = dateSetup.dates;
		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const bottomValue = getCachedDateTimeFormat(locale, {
				hour: "numeric",
			}).format(date);

			bottomValues.push(
				<text
					className={styles.calendarBottomText}
					fontFamily={fontFamily}
					key={date.getTime()}
					x={columnWidth * (i + +rtl)}
					y={headerHeight * 0.8}
				>
					{bottomValue}
				</text>,
			);
			if (i !== 0 && date.getDate() !== dates[i - 1].getDate()) {
				const displayDate = dates[i - 1];
				const topValue = `${getLocalDayOfWeek(
					displayDate,
					locale,
					"long",
				)}, ${displayDate.getDate()} ${getLocaleMonth(displayDate, locale)}`;
				const topPosition = (date.getHours() - 24) / 2;
				topValues.push(
					<TopPartOfCalendar
						key={topValue + displayDate.getFullYear()}
						value={topValue}
						x1Line={columnWidth * i}
						xText={columnWidth * (i + topPosition)}
						y1Line={0}
						y2Line={topDefaultHeight}
						yText={topDefaultHeight * 0.9}
					/>,
				);
			}
		}

		return [topValues, bottomValues];
	};

	let topValues: ReactNode[] = [];
	let bottomValues: ReactNode[] = [];
	switch (dateSetup.viewMode) {
		case ViewMode.Year:
			[topValues, bottomValues] = getCalendarValuesForYear();
			break;
		case ViewMode.QuarterYear:
			[topValues, bottomValues] = getCalendarValuesForQuarterYear();
			break;
		case ViewMode.Month:
			[topValues, bottomValues] = getCalendarValuesForMonth();
			break;
		case ViewMode.Week:
			[topValues, bottomValues] = getCalendarValuesForWeek();
			break;
		case ViewMode.Day:
			[topValues, bottomValues] = getCalendarValuesForDay();
			break;
		case ViewMode.QuarterDay:
		case ViewMode.HalfDay:
			[topValues, bottomValues] = getCalendarValuesForPartOfDay();
			break;
		case ViewMode.Hour:
			[topValues, bottomValues] = getCalendarValuesForHour();
	}
	return (
		<g
			className="calendar"
			fontFamily={fontFamily}
			fontSize={fontSize}
		>
			<rect
				className={styles.calendarHeader}
				height={headerHeight}
				width={columnWidth * dateSetup.dates.length}
				x={0}
				y={0}
			/>
			{bottomValues} {topValues}
		</g>
	);
};
