import React, { useState } from "react";
import { 
	FaTable, 
	FaPlus, 
	FaMinus, 
	FaTrash, 
	FaArrowUp, 
	FaArrowDown, 
	FaArrowLeft, 
	FaArrowRight 
} from "react-icons/fa";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type Editor } from "@tiptap/react";


interface TableToolsProps {
	editor: Editor;
}

const TableTools: React.FC<TableToolsProps> = ({ editor }) => {
	const [tableRows, setTableRows] = useState(3);
	const [tableCols, setTableCols] = useState(3);
	const [isInTable, setIsInTable] = useState(false);

	// Update table state when editor updates
	React.useEffect(() => {
		if (!editor) return;

		const updateTableState = (): void => {
			try {
				const inTable = editor.isActive("table");
				setIsInTable(inTable);
			} catch (error) {
				console.warn("Error checking table state:", error);
				setIsInTable(false);
			}
		};

		// Initial check
		updateTableState();

		// Listen for editor updates
		editor.on("selectionUpdate", updateTableState);
		editor.on("transaction", updateTableState);

		return () => {
			editor.off("selectionUpdate", updateTableState);
			editor.off("transaction", updateTableState);
		};
	}, [editor]);

	const insertTable = (): void => {
		editor
			.chain()
			.focus()
			.insertTable({
				rows: tableRows,
				cols: tableCols,
				withHeaderRow: true,
			})
			.run();
	};

	const executeTableAction = (actionName: string, command: () => boolean): void => {
		try {
			const success = command();
			if (!success) {
				console.warn(`Table action "${actionName}" could not be executed`);
			}
		} catch (error) {
			console.error(`Error executing table action "${actionName}":`, error);
		}
	};

	const tableActions = [
		{
			label: "Add Column Before",
			icon: <FaArrowLeft className="w-3 h-3" />,
			action: () => executeTableAction("Add Column Before", () => 
				editor.chain().focus()
					.addColumnBefore()
					.run(),
			),
		},
		{
			label: "Add Column After", 
			icon: <FaArrowRight className="w-3 h-3" />,
			action: () => executeTableAction("Add Column After", () => 
				editor.chain().focus()
					.addColumnAfter()
					.run(),
			),
		},
		{
			label: "Delete Column",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Delete Column", () => 
				editor.chain().focus()
					.deleteColumn()
					.run(),
			),
		},
		{
			label: "Add Row Before",
			icon: <FaArrowUp className="w-3 h-3" />,
			action: () => executeTableAction("Add Row Before", () => 
				editor.chain().focus()
					.addRowBefore()
					.run(),
			),
		},
		{
			label: "Add Row After",
			icon: <FaArrowDown className="w-3 h-3" />,
			action: () => executeTableAction("Add Row After", () => 
				editor.chain().focus()
					.addRowAfter()
					.run(),
			),
		},
		{
			label: "Delete Row",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Delete Row", () => 
				editor.chain().focus()
					.deleteRow()
					.run(),
			),
		},
		{
			label: "Toggle Header Column",
			icon: <FaTable className="w-3 h-3" />,
			action: () => executeTableAction("Toggle Header Column", () => 
				editor.chain().focus()
					.toggleHeaderColumn()
					.run(),
			),
		},
		{
			label: "Toggle Header Row",
			icon: <FaTable className="w-3 h-3" />,
			action: () => executeTableAction("Toggle Header Row", () => 
				editor.chain().focus()
					.toggleHeaderRow()
					.run(),
			),
		},
		{
			label: "Merge Cells",
			icon: <FaPlus className="w-3 h-3" />,
			action: () => executeTableAction("Merge Cells", () => 
				editor.chain().focus()
					.mergeCells()
					.run(),
			),
		},
		{
			label: "Split Cell",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Split Cell", () => 
				editor.chain().focus()
					.splitCell()
					.run(),
			),
		},
		{
			label: "Delete Table",
			icon: <FaTrash className="w-3 h-3" />,
			action: () => executeTableAction("Delete Table", () => 
				editor.chain().focus()
					.deleteTable()
					.run(),
			),
			destructive: true,
		},
	];

	return (
		<div className="flex items-center gap-1">
			{/* Table Actions Dropdown - only show when in table */}
			{isInTable && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="px-1.5 py-1 h-8 hover:bg-gray-100 active:bg-gray-200 bg-blue-50 border border-blue-200"
							size="sm"
							title="Table Actions"
							variant="ghost"
						>
							<FaTable className="text-blue-600" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56">
						{tableActions.map((action, index) => (
							<React.Fragment key={action.label}>
								{(index === 2 || index === 5 || index === 9) && <DropdownMenuSeparator />}
								<DropdownMenuItem
									className={action.destructive ? "text-red-600 focus:text-red-600" : ""}
									onClick={action.action}
								>
									<div className="flex items-center gap-2">
										{action.icon}
										{action.label}
									</div>
								</DropdownMenuItem>
							</React.Fragment>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}	
			{/* Insert Table Popover - always available */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						className={`px-1.5 py-1 h-8 hover:bg-gray-100 active:bg-gray-200 ${isInTable ? "opacity-60" : ""}`}
						size="sm"
						title="Insert Table"
						variant="ghost"
					>
						<FaTable />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="grid gap-4">
						<div className="space-y-2">
							<h4 className="font-medium leading-none">Insert Table</h4>
							<p className="text-sm text-muted-foreground">
								Set the number of rows and columns for your table.
							</p>
						</div>
						<div className="grid gap-2">
							<div className="grid grid-cols-3 items-center gap-4">
								<Label htmlFor="rows">Rows</Label>
								<Input
									className="col-span-2 h-8"
									id="rows"
									max="20"
									min="1"
									onChange={(e) => setTableRows(Number(e.target.value))}
									type="number"
									value={tableRows}
								/>
							</div>
							<div className="grid grid-cols-3 items-center gap-4">
								<Label htmlFor="columns">Columns</Label>
								<Input
									className="col-span-2 h-8"
									id="columns"
									max="10"
									min="1"
									onChange={(e) => setTableCols(Number(e.target.value))}
									type="number"
									value={tableCols}
								/>
							</div>
						</div>
						<Button onClick={insertTable}>
							Insert Table
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default TableTools; 