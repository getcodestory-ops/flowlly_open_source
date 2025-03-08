function timeSinceLatestSignificantEvent(activity: any) {
	let significantEvents = activity.history.filter(
		(e: any) => e.severity === "severe",
	);

	if (significantEvents.length === 0) {
		significantEvents = activity.history.filter(
			(e: any) => e.severity === "moderate",
		);
	}

	if (significantEvents.length === 0) {
		significantEvents = activity.history.filter(
			(e: any) => e.severity === "low",
		);
	}

	if (significantEvents.length === 0) {
		return "N/A";
	}

	significantEvents.sort(
		(a: any, b: any) =>
			(new Date(b.created_at) as any) - (new Date(a.created_at) as any),
	);

	const latestEvent = new Date(significantEvents[0].created_at);
	const now = new Date();
	const timeDiff = (now as any) - (latestEvent as any); // Difference in milliseconds

	const hours = timeDiff / 1000 / 60 / 60;
	const days = hours / 24;
	const weeks = days / 7;
	const months = days / 30;
	const years = days / 365;

	if (hours < 24) {
		return `${Math.floor(hours)} hrs ago`;
	} else if (days < 7) {
		return `${Math.floor(days)} days ago`;
	} else if (weeks < 4) {
		return `${Math.floor(weeks)} wks ago`;
	} else if (months < 12) {
		return `${Math.floor(months)} months ago`;
	} else {
		return years <= 1 ? "1 year ago" : ">1 yr ago";
	}
}

export default timeSinceLatestSignificantEvent;

// Function to extract and sort significant events
export function extractAndSortSignificantEvents(activity: any) {
	let significantEvents = activity.history.filter(
		(e: any) => e.severity === "severe",
	);

	if (significantEvents.length === 0) {
		significantEvents = activity.history.filter(
			(e: any) => e.severity === "moderate",
		);
	}

	if (significantEvents.length === 0) {
		significantEvents = activity.history.filter(
			(e: any) => e.severity === "low",
		);
	}

	significantEvents.sort(
		(a: any, b: any) =>
			(new Date(b.created_at) as any) - (new Date(a.created_at) as any),
	);

	return significantEvents;
}

// Function to convert date to time text
export function convertDateToTimeText(date: string) {
	const eventDate = new Date(date);
	const now = new Date();
	const timeDiff = (now as any) - (eventDate as any); // Difference in milliseconds

	const hours = timeDiff / 1000 / 60 / 60;
	const days = hours / 24;
	const weeks = days / 7;
	const months = days / 30;
	const years = days / 365;

	if (hours < 24) {
		return `${Math.floor(hours)} hrs ago`;
	} else if (days < 7) {
		return `${Math.floor(days)} days ago`;
	} else if (weeks < 4) {
		return `${Math.floor(weeks)} wks ago`;
	} else if (months < 12) {
		return `${Math.floor(months)} month ago`;
	} else {
		return years <= 1 ? "1 year ago" : ">1 yr ago";
	}
}
