import { Editor } from "@tiptap/react";

type JsonTable = 
{
    type: "table",
    content: JsonTableRow[]
}

type JsonTableRow = {
    type: "tableRow" | "tableHeader",
    content: JsonTableCell[]
}

type JsonTableCell = {
    type: "tableCell",
    content: JsonTableCellContent[]
}

type JsonTableCellContent = {
    type: "paragraph",
    content: {
        text: string
        type: "text"
    }[]
}

const convertJsonTableToCsvTable = (table: JsonTable): string[][] => {
    if (!table || table.type !== "table" || !table.content) {
        return [["Invalid Table Data"]];
    }

    return table.content.map((row) => 
        row.content.map((cell) => 
            cell.content.map((cellContent) => 
                cellContent.content.map(content => content.text == "Ref." ? "" : content.text).join(" ") // Joining multiple text contents in a cell
            ).join(" ") // Joining multiple paragraphs in a cell
        )
    );
};

const extractTablesFromEditor = (editor: Editor): string[][][] => {
    if (!editor) return [];
  
    const editorJson = editor.getJSON(); // Get editor's content as JSON
    if (!editorJson || !editorJson.content) return [];

    const allTables = editorJson.content.map((node) => {
        if (node.type === "table") {
            return convertJsonTableToCsvTable(node as JsonTable)
        }
    }).filter((table) => table !== null && table !== undefined) as string[][][]
  
    return allTables;
};

const convertToCSV = (tableData: string[][]) => {
    return tableData
      .map((row) => row.map((cell) => `"${cell}"`).join(",")) // Format as CSV row
      .join("\n"); // Join rows with newline
};
  

const downloadCSV = (csvData: string, filename = "tables.csv") => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
  
export  const handleExportTables = (editor: Editor) => {
    const tables = extractTablesFromEditor(editor);

    if (tables.length === 0) {
        alert("No tables found in the document.");
        return;
    }

    const csvData = tables.map((table, index) => {
        const tableWithTitle = [
            [`Table ${index + 1}`], // Add table title
            ...table, // Include the table data with headers
            [""], // Empty row for separation
        ];
        return convertToCSV(tableWithTitle);
    }).join("\n\n");
    downloadCSV(csvData);
};
  