import { Editor } from "@tiptap/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type JsonTable = {
  type: "table";
  content: JsonTableRow[];
};

type JsonTableRow = {
  type: "tableRow" | "tableHeader";
  content: JsonTableCell[];
};

type JsonTableCell = {
  type: "tableCell";
  content: JsonTableCellContent[];
};

type JsonTableCellContent = {
  type: "paragraph";
  content: {
    text: string;
    type: "text";
  }[];
};

const convertJsonTableToCsvTable = (table: JsonTable): string[][] | null => {
	if (!table || table.type !== "table" || !table.content) {
		return null;
	}

	return table.content.map((row) =>
		row.content.map(
			(cell) =>
				cell.content
					.map(
						(cellContent) =>
							cellContent?.content
								?.map((content) =>
									content?.text == "Ref." ? "" : content?.text,
								)
								.join(" "), // Joining multiple text contents in a cell
					)
					.join(" "), // Joining multiple paragraphs in a cell
		),
	);
};

const extractTablesFromEditor = (editor: Editor): string[][][] => {
	if (!editor) return [];

	const editorJson = editor.getJSON(); // Get editor's content as JSON
	if (!editorJson || !editorJson.content) return [];

	const allTables = editorJson.content
		.map((node) => {
			if (node.type === "table") {
				return convertJsonTableToCsvTable(node as JsonTable);
			}
		})
		.filter((table) => table !== null && table !== undefined) as string[][][];

	return allTables;
};

const convertToCSV = (tableData: string[][]): string => {
	return tableData
		.map((row) => row.map((cell) => `"${cell}"`).join(",")) // Format as CSV row
		.join("\n"); // Join rows with newline
};

const downloadCSV = (csvData: string, filename = "tables.csv"): void => {
	const blob = new Blob([csvData], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

export const handleExportTables = (editor: Editor): void => {
	const tables = extractTablesFromEditor(editor);

	if (tables.length === 0) {
		alert("No tables found in the document.");
		return;
	}

	const csvData = tables
		.map((table, index) => {
			const tableWithTitle = [
				[`Table ${index + 1}`], // Add table title
				...table, // Include the table data with headers
				[""], // Empty row for separation
			];
			return convertToCSV(tableWithTitle);
		})
		.join("\n\n");
	downloadCSV(csvData);
};

export const areThereTablesinEditor = (editor: Editor): boolean => {
	if (!editor) return false;
	
	const editorJson = editor.getJSON(); // Get editor's content as JSON
	if (!editorJson || !editorJson.content) return false;

	const areThereTables = editorJson.content.some((node) => node.type === "table" && node.content);
	return areThereTables;
};

// Function to open browser print dialog
export const printDocument = (editorElement: HTMLElement): void => {
	// Create a new window for printing
	const printWindow = window.open("", "_blank");
	
	if (!printWindow) {
		alert("Please allow popups for this website to use the print feature.");
		return;
	}
	
	// Clone the element to preserve all attributes and styles
	const clonedElement = editorElement.cloneNode(true) as HTMLElement;
	
	// Get all computed styles from the original element
	const computedStyle = window.getComputedStyle(editorElement);
	const styles = Array.from(computedStyle).map((prop) => `${prop}: ${computedStyle.getPropertyValue(prop)}`)
		.join("; ");
	
	// Create a new document in the print window
	printWindow.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Print Document</title>
			<style>
				body { 
					font-family: Arial, sans-serif;
					line-height: 1.5;
					color: #333;
					padding: 20px;
					max-width: 800px;
					margin: 0 auto;
				}
				
				table {
					border-collapse: collapse;
					width: 100%;
					margin: 15px 0;
				}
				
				th, td {
					border: 1px solid #ddd;
					padding: 8px;
				}
				
				th {
					background-color: #f2f2f2;
				}
				
				img {
					max-width: 100%;
					height: auto;
				}

				/* Preserve SVG styles */
				svg {
					width: 100%;
					height: auto;
					display: block;
					margin: 1em 0;
				}

				/* Ensure SVG elements are visible */
				path, line, rect, circle, ellipse, polygon, polyline, text {
					vector-effect: non-scaling-stroke;
				}

				/* Preserve chart colors and styles */
				.chart-container {
					width: 100%;
					height: auto;
					margin: 1em 0;
				}

				/* Ensure all elements are visible in print */
				* {
					-webkit-print-color-adjust: exact !important;
					print-color-adjust: exact !important;
					color-adjust: exact !important;
				}
				
				@media print {
					body {
						padding: 0;
					}
					
					/* Ensure SVG elements are visible in print */
					svg {
						overflow: visible !important;
					}
					
					/* Force background colors to print */
					* {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
						color-adjust: exact !important;
					}

					/* Set 0.5 inch margins on all sides */
					@page {
						margin: 0.5in;
						size: auto;
					}

					/* Hide any header/footer elements */
					header, footer, .header, .footer {
						display: none !important;
					}

					/* Remove page numbers */
					.page-number, .page-numbers, .page-numbering {
						display: none !important;
					}

					/* Remove any automatic page numbers */
					@page :first {
						margin-top: 0.5in;
					}

					/* Remove any automatic headers/footers */
					@page :left {
						margin-left: 0.5in;
					}

					@page :right {
						margin-right: 0.5in;
					}

					/* Ensure content starts at the top of the page */
					body {
						margin: 0;
						padding: 0;
					}
				}
			</style>
		</head>
		<body>
			${clonedElement.outerHTML}
			<script>
				// Wait for all resources to load before printing
				window.onload = function() {
					// Ensure all SVG elements are properly rendered
					const svgs = document.querySelectorAll('svg');
					svgs.forEach(svg => {
						// Force SVG to be visible
						svg.style.overflow = 'visible';
						svg.style.display = 'block';
					});

					// Small delay to ensure everything is rendered
					setTimeout(function() {
						window.print();
						// Close the window after printing (delayed to ensure print dialog is processed)
						setTimeout(function() {
							window.close();
						}, 500);
					}, 100);
				};
			</script>
		</body>
		</html>
	`);
	
	printWindow.document.close();
};

export const convertToPdf = async(editorElement: HTMLElement): Promise<void> => {
	const canvas = await html2canvas(editorElement as HTMLElement, {
		scale: 1, // Higher scale for better quality
		useCORS: true, // To handle images from other domains
		logging: false,
		backgroundColor: "#ffffff",
	});

	const pdf = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});
		
	// Define margins (in mm)
	const margin = {
		top: 15,
		right: 15,
		bottom: 15,
		left: 15,
	};
		
	// Calculate dimensions
	const pageWidth = 210; // A4 width in mm
	const pageHeight = 297; // A4 height in mm
	const contentWidth = pageWidth - margin.left - margin.right;
	const contentHeight = pageHeight - margin.top - margin.bottom;
		
	// Get PDF page ratio
	const pageRatio = contentHeight / contentWidth;
		
	// Create a new canvas to split content into pages
	const totalPages = Math.ceil(canvas.height / (canvas.width * pageRatio));
	let currentPage = 0;
		
	// Process each page
	while (currentPage < totalPages) {
		// For pages after the first one, add a new page
		if (currentPage > 0) {
			pdf.addPage();
		}
			
		// Calculate the slice of the canvas for this page
		const sliceY = currentPage * (canvas.width * pageRatio);
		const sliceHeight = Math.min(canvas.width * pageRatio, canvas.height - sliceY);
			
		// Create a temporary canvas for this slice
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvas.width;
		tempCanvas.height = sliceHeight;
		const tempCtx = tempCanvas.getContext("2d");
			
		if (tempCtx) {
			// Draw the slice to the temporary canvas
			tempCtx.drawImage(
				canvas,
				0, sliceY, canvas.width, sliceHeight,
				0, 0, canvas.width, sliceHeight,
			);
				
			// Add the slice to the PDF
			const imgData = tempCanvas.toDataURL("image/png");
			pdf.addImage(
				imgData,
				"PNG",
				margin.left,
				margin.top,
				contentWidth,
				(sliceHeight * contentWidth) / canvas.width,
			);
		}
			
		currentPage++;
	}
		
	// Save the PDF
	pdf.save("document.pdf");
};
