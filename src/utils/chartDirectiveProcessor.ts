/**
 * Utility functions to process chart directives in markdown content
 * Converts between :::chart directive format and TipTap chart nodes
 */

export interface ChartDirectiveMatch {
  fullMatch: string;
  data: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse chart directives from markdown content
 * Matches pattern: :::chart\n{json data}\n:::
 */
export function parseChartDirectives(content: string): ChartDirectiveMatch[] {
	const directiveRegex = /:::chart\s*\n([\s\S]*?)\n:::/g;
	const matches: ChartDirectiveMatch[] = [];
	let match;

	while ((match = directiveRegex.exec(content)) !== null) {
		matches.push({
			fullMatch: match[0],
			data: match[1].trim(),
			startIndex: match.index,
			endIndex: match.index + match[0].length,
		});
	}

	return matches;
}

/**
 * Convert chart directives to HTML chart tags for TipTap
 * :::chart\n{data}\n::: -> <chart data='{data}'></chart>
 */
export function convertDirectivesToHTML(content: string): string {
	const directiveRegex = /:::chart\s*\n([\s\S]*?)\n:::/g;
  
	return content.replace(directiveRegex, (match, data) => {
		const trimmedData = data.trim();
    
		// Validate JSON
		try {
			JSON.parse(trimmedData);
			// Escape single quotes in the data for HTML attribute
			const escapedData = trimmedData.replace(/'/g, "&#39;");
			return `<chart data='${escapedData}'></chart>`;
		} catch (error) {
			console.error("Invalid JSON in chart directive:", error);
			return `<div class="chart-error">Invalid chart data: ${error}</div>`;
		}
	});
}

/**
 * Convert HTML chart tags back to chart directives for markdown export
 * <chart data='{data}'></chart> -> :::chart\n{data}\n:::
 */
export function convertHTMLToDirectives(content: string): string {
	const chartTagRegex = /<chart\s+data='([^']*)'[^>]*><\/chart>/g;
  
	return content.replace(chartTagRegex, (match, data) => {
		// Unescape HTML entities
		const unescapedData = data.replace(/&#39;/g, "'");
    
		try {
			// Validate and format JSON
			const parsedData = JSON.parse(unescapedData);
			const formattedData = JSON.stringify(parsedData, null, 2);
			return `:::chart\n${formattedData}\n:::`;
		} catch (error) {
			console.error("Invalid JSON in chart tag:", error);
			return match; // Return original if invalid
		}
	});
}

/**
 * Extract chart data from directive content
 */
export function extractChartData(directiveContent: string): any | null {
	try {
		const matches = parseChartDirectives(directiveContent);
		if (matches.length > 0) {
			return JSON.parse(matches[0].data);
		}
		return null;
	} catch (error) {
		console.error("Error extracting chart data:", error);
		return null;
	}
}

/**
 * Create a chart directive string from chart data
 */
export function createChartDirective(chartData: any): string {
	try {
		const jsonString = JSON.stringify(chartData, null, 2);
		return `:::chart\n${jsonString}\n:::`;
	} catch (error) {
		console.error("Error creating chart directive:", error);
		return "";
	}
}

/**
 * Validate if a string contains valid chart directive syntax
 */
export function isValidChartDirective(content: string): boolean {
	const matches = parseChartDirectives(content);
  
	for (const match of matches) {
		try {
			JSON.parse(match.data);
		} catch {
			return false;
		}
	}
  
	return matches.length > 0;
} 