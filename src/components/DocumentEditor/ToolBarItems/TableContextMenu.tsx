import React, { useState, useEffect } from "react";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Editor } from "@tiptap/react";

interface TableContextMenuProps {
	editor: Editor;
}

const TableContextMenu: React.FC<TableContextMenuProps> = ({ editor }) => {
	const [isInTable, setIsInTable] = useState(false);

	useEffect(() => {
		if (!editor) return;

		const updateTableState = (): void => {
			try {
				setIsInTable(editor.isActive("table"));
			} catch (error) {
				setIsInTable(false);
			}
		};

		updateTableState();
		editor.on("selectionUpdate", updateTableState);
		editor.on("transaction", updateTableState);

		return () => {
			editor.off("selectionUpdate", updateTableState);
			editor.off("transaction", updateTableState);
		};
	}, [editor]);

	const executeTableAction = (actionName: string, command: () => boolean): void => {
		try {
			command();
		} catch (error) {
			console.error(`Error executing table action "${actionName}":`, error);
		}
	};

	const tableActions = [
		{
			label: "Add Column Before",
			icon: <FaArrowLeft className="w-3 h-3" />,
			action: () => executeTableAction("Add Column Before", () => 
				editor.chain().focus().addColumnBefore().run()
			),
		},
		{
			label: "Add Column After", 
			icon: <FaArrowRight className="w-3 h-3" />,
			action: () => executeTableAction("Add Column After", () => 
				editor.chain().focus().addColumnAfter().run()
			),
		},
		{
			label: "Delete Column",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Delete Column", () => 
				editor.chain().focus().deleteColumn().run()
			),
		},
		{
			label: "Add Row Before",
			icon: <FaArrowUp className="w-3 h-3" />,
			action: () => executeTableAction("Add Row Before", () => 
				editor.chain().focus().addRowBefore().run()
			),
		},
		{
			label: "Add Row After",
			icon: <FaArrowDown className="w-3 h-3" />,
			action: () => executeTableAction("Add Row After", () => 
				editor.chain().focus().addRowAfter().run()
			),
		},
		{
			label: "Delete Row",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Delete Row", () => 
				editor.chain().focus().deleteRow().run()
			),
		},
		{
			label: "Toggle Header Column",
			icon: <FaTable className="w-3 h-3" />,
			action: () => executeTableAction("Toggle Header Column", () => 
				editor.chain().focus().toggleHeaderColumn().run()
			),
		},
		{
			label: "Toggle Header Row",
			icon: <FaTable className="w-3 h-3" />,
			action: () => executeTableAction("Toggle Header Row", () => 
				editor.chain().focus().toggleHeaderRow().run()
			),
		},
		{
			label: "Merge Cells",
			icon: <FaPlus className="w-3 h-3" />,
			action: () => executeTableAction("Merge Cells", () => 
				editor.chain().focus().mergeCells().run()
			),
		},
		{
			label: "Split Cell",
			icon: <FaMinus className="w-3 h-3" />,
			action: () => executeTableAction("Split Cell", () => 
				editor.chain().focus().splitCell().run()
			),
		},
		{
			label: "Delete Table",
			icon: <FaTrash className="w-3 h-3" />,
			action: () => executeTableAction("Delete Table", () => 
				editor.chain().focus().deleteTable().run()
			),
			destructive: true,
		},
	];

	// Only render when cursor is inside a table
	if (!isInTable) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="px-2 py-1 h-8 hover:bg-blue-100 bg-blue-50 border border-blue-200 gap-1"
					size="sm"
					variant="ghost"
				>
					<FaTable className="h-3.5 w-3.5 text-blue-600" />
					<span className="text-xs text-blue-700">Table</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Columns</div>
				{tableActions.slice(0, 3).map((action) => (
					<DropdownMenuItem
						key={action.label}
						onClick={action.action}
					>
						<div className="flex items-center gap-2">
							{action.icon}
							{action.label}
						</div>
					</DropdownMenuItem>
				))}
				
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Rows</div>
				{tableActions.slice(3, 6).map((action) => (
					<DropdownMenuItem
						key={action.label}
						onClick={action.action}
					>
						<div className="flex items-center gap-2">
							{action.icon}
							{action.label}
						</div>
					</DropdownMenuItem>
				))}
				
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Headers & Cells</div>
				{tableActions.slice(6, 10).map((action) => (
					<DropdownMenuItem
						key={action.label}
						onClick={action.action}
					>
						<div className="flex items-center gap-2">
							{action.icon}
							{action.label}
						</div>
					</DropdownMenuItem>
				))}
				
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-red-600 focus:text-red-600"
					onClick={tableActions[10].action}
				>
					<div className="flex items-center gap-2">
						{tableActions[10].icon}
						{tableActions[10].label}
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TableContextMenu;
