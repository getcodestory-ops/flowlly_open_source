export function getFirstFiveWords(str: string) {
	// Split the string into an array of words
	let words = str.split(" ");

	// Select the first 5 words
	let firstFiveWords = words.slice(0, 5);

	// Join the first 5 words back into a string
	let result = firstFiveWords.join(" ");

	return result;
}
