import React, { useState } from "react";
import { FaTable } from "react-icons/fa";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

interface TableToolsProps {
	editor: Editor;
}

const TableTools: React.FC<TableToolsProps> = ({ editor }) => {
	const [tableRows, setTableRows] = useState(3);
	const [tableCols, setTableCols] = useState(3);

	return (
		<Popover>
			<PopoverTrigger>
				<ToolTipedButton onClick={() => {}} tooltip="Insert Table">
					<FaTable />
				</ToolTipedButton>
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
								onChange={(e) => setTableCols(Number(e.target.value))}
								type="number"
								value={tableCols}
							/>
						</div>
					</div>
					<Button
						onClick={() => {
							editor
								.chain()
								.focus()
								.insertTable({
									rows: tableRows,
									cols: tableCols,
									withHeaderRow: true,
								})
								.run();
						}}
					>
						Insert Table
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default TableTools; 