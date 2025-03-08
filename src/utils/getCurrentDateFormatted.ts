export default function getCurrentDateFormatted(date = new Date()): string {
	// const date = new Date();
	// let dd: number | string = date.getDate() + 1;
	let dd: number | string = date.getDate();
	let mm: number | string = date.getMonth() + 1; // January is 0!
	const yyyy: number = date.getFullYear();

	if (dd < 10) {
		dd = "0" + dd;
	}

	if (mm < 10) {
		mm = "0" + mm;
	}

	return `${yyyy}-${mm}-${dd}`;
}

export function dateDiffInDays(a: Date, b: Date) {
	const _MS_PER_DAY = 1000 * 60 * 60 * 24;
	if (!a || !b) return 0;
	const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
