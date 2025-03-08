import { formatDistanceToNow } from "date-fns";
import { parseISO } from "date-fns";


export function formatDate(dateString: string): string {
	// Create a new Date object from the input date string
	const date = new Date(dateString);
  
	// Define arrays for month and AM/PM strings
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
  
	// Extract the month, day, year, and time components
	const month = monthNames[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
  
	let hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
  
	// Convert hours from 24-hour format to 12-hour format
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
  
	// Format minutes to be always two digits
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
	// Construct the formatted date string
	const formattedDate = `${month} ${day}, ${year} ${hours}:${formattedMinutes} ${ampm}`;
  
	return formattedDate;
}
  
export const timeAgoDate = (date: Date): string => {
	// const date = new Date(dateString)
	const now = new Date();
	// const date = new Date(dateString);
  
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
	const intervals = [
		{ label: "y", seconds: 31536000 }, // 1 year = 365 * 24 * 60 * 60
		{ label: "m", seconds: 2592000 }, // 1 month = 30 * 24 * 60 * 60
		{ label: "wk", seconds: 604800 }, // 1 week = 7 * 24 * 60 * 60
		{ label: "d", seconds: 86400 }, // 1 day = 24 * 60 * 60
		{ label: "h", seconds: 3600 }, // 1 hour = 60 * 60
		{ label: "m", seconds: 60 }, // 1 minute = 60
		{ label: "s", seconds: 1 }, // 1 second
	];
  
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return `Created ${count}${interval.label} ago`;
		}
	}
  
	return "Created just now";
};

export function convertIsoToTimeAgo(dateString?: string) {
	if (!dateString) return "";
  
	const utcDate = parseISO(`${dateString}Z`);
	const timeAgo = formatDistanceToNow(utcDate, {
		addSuffix: true,
	});
	return timeAgo;
}
  