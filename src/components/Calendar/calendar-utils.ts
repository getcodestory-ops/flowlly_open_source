import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

export const dayMapping = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

const locales = {
	"en-US": enUS,
};

export const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});



export const formatLocalTime = (date: Date): string => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	} catch {
		return date.toLocaleTimeString();
	}
};

export const parseGraphDateTime = (dateTime: string, timeZone: string): Date => {
	try {
		const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(dateTime);
		
		if (hasTimezone) {
			return new Date(dateTime);
		}
		
		if (timeZone === "UTC" || timeZone === "utc") {
			const cleanedDateTime = dateTime.replace(/\.\d+$/, "");
			return new Date(`${cleanedDateTime}Z`);
		}
		
		const cleanedDateTime = dateTime.replace(/\.\d+$/, "");
		return new Date(`${cleanedDateTime}Z`);
	} catch (error) {
		console.error("Error parsing datetime:", error, dateTime, timeZone);
		return new Date(dateTime);
	}
};