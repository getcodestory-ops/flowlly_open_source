export const DEFAULT_SCROLL_TIME = (() => {
	const time = new Date();
	time.setHours(8, 0, 0, 0); 
	return time;
})();