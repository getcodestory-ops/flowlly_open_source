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
