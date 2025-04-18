import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo, KeyboardEvent } from "react";
import { getEventResourceRows } from "@/api/eventResourceRoutes";
import { useStore } from "@/utils/store";
import { Input } from "@/components/ui/input";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	ColumnDef,
	flexRender,
	SortingState,
	FilterFn,
	RowData,
	Row,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	Download,
	Table as TableIcon,
	LayoutDashboard,
} from "lucide-react";
import { DataTablePagination } from "@/components/Schedule/ScheduleTable/DataTablePagination";
import { DashboardViewer } from "./DashboardViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RunningLogViewerProps {
	logId: string;
	body?: {
		entries: {
			id: string;
			row: Record<string, string | number | boolean | null>;
			created_at: string;
			hidden: boolean;
			event_resource_id: string;
		}[];
		summary?: string;
	};
}

declare module "@tanstack/react-table" {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: any) => void;
	}
}

const RunningLogViewer = ({ logId, body }: RunningLogViewerProps): React.ReactNode => {
	const [tableData, setTableData] = useState<Record<string, any>[]>([]);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [headers, setHeaders] = useState<string[]>([]);
	const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
	const session = useStore((state) => state.session);

	useEffect(() => {
		if (body && body.entries.length > 0) {
			setTableData(body.entries.map((entry) => entry.row));
			setHeaders(Object.keys(body.entries[0].row));
		} else {
			fetchEventResource();
		}
	}, [body]);

	const fetchEventResource = (): void => {
		if (!session) return;
		getEventResourceRows(session, logId).then((eventResource) => {
			if (eventResource) {
				setTableData(eventResource.map((entry) => entry.row));
				setHeaders(Object.keys(eventResource[0].row));
			}
		});
	};

	const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
		const searchValue = value.toLowerCase();
		return Object.values(row.original).some(
			(val) =>
				val !== null &&
				val !== undefined &&
				String(val).toLowerCase()
					.includes(searchValue),
		);
	};

	const updateData = (rowIndex: number, columnId: string, value: any) => {
		setTableData((old) =>
			old.map((row, index) => {
				if (index === rowIndex) {
					return {
						...row,
						[columnId]: value,
					};
				}
				return row;
			}),
		);
	};

	const moveToNextCell = (currentRowIndex: number, currentColumnId: string, direction: "right" | "down" | "up") => {
		const columnIndex = headers.indexOf(currentColumnId);
		let nextRowIndex = currentRowIndex;
		let nextColumnIndex = columnIndex;

		if (direction === "right") {
			nextColumnIndex = (columnIndex + 1) % headers.length;
			if (nextColumnIndex === 0) {
				nextRowIndex = (currentRowIndex + 1) % tableData.length;
			}
		} else if (direction === "down") {
			nextRowIndex = (currentRowIndex + 1) % tableData.length;
		} else if (direction === "up") {
			nextRowIndex = currentRowIndex - 1;
			if (nextRowIndex < 0) nextRowIndex = tableData.length - 1;
		}

		setEditingCell({
			rowIndex: nextRowIndex,
			columnId: headers[nextColumnIndex],
		});
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnId: string) => {
		if (e.key === "Enter" || e.key === "Tab") {
			e.preventDefault();
			if (e.shiftKey) {
				moveToNextCell(rowIndex, columnId, "up");
			} else {
				moveToNextCell(rowIndex, columnId, e.key === "Enter" ? "down" : "right");
			}
		} else if (e.key === "Escape") {
			setEditingCell(null);
		}
	};

	const columns = useMemo<ColumnDef<Record<string, any>, any>[]>(() => {
		return headers.map((header) => ({
			id: header,
			accessorFn: (row: Record<string, any>) => row[header],
			header: ({ column }) => (
				<Button
					className="p-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					variant="ghost"
				>
					{header}
				</Button>
			),
			cell: ({ row, column, table }) => {
				const value = row.getValue(column.id);
				const rowIndex = row.index;
				const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === column.id;

				const cellBaseStyle = "min-h-[28px] px-2 w-full text-xs";

				if (isEditing) {
					return (
						<Input
							autoFocus
							className={`${cellBaseStyle} focus:ring-2 focus:ring-offset-0 focus:outline-none`}
							onBlur={() => setEditingCell(null)}
							onChange={(e) => {
								table.options.meta?.updateData(rowIndex, column.id, e.target.value);
							}}
							onKeyDown={(e) => handleKeyDown(e, rowIndex, column.id)}
							value={value as string}
						/>
					);
				}

				return (
					<div
						className={`${cellBaseStyle} -mx-2 rounded hover:bg-gray-50 cursor-text flex items-center`}
						onDoubleClick={() => setEditingCell({ rowIndex, columnId: column.id })}
					>
						{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
					</div>
				);
			},
		}));
	}, [headers, editingCell]);

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: fuzzyFilter,
		state: {
			sorting,
			globalFilter,
		},
		meta: {
			updateData,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	const downloadCSV = () => {
		if (!tableData.length || !headers.length) return;

		// Convert the data to CSV format
		const csvContent = [
			// Headers row
			headers.join(","),
			// Data rows
			...table.getFilteredRowModel().rows.map((row) => 
				headers.map((header) => {
					const value = row.original[header];
					// Handle special cases and escape values
					if (value === null || value === undefined) return "";
					if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, "\"\"")}"`;
					if (typeof value === "string" && (value.includes(",") || value.includes("\"") || value.includes("\n"))) {
						return `"${value.replace(/"/g, "\"\"")}"`;
					}
					return String(value);
				}).join(","),
			),
		].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `log_data_${logId}_${new Date().toISOString()
			.split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="rounded-md border border-gray-200 shadow-sm overflow-auto">
			{!tableData.length || !headers.length ? (
				<div className="p-4 text-gray-500">Loading...</div>
			) : (
				<Tabs className="w-full" defaultValue="table">
					<div className="flex items-center justify-between py-2 px-4 border-b">
						<TabsList>
							<TabsTrigger className="flex items-center gap-2" value="table">
								<TableIcon className="h-4 w-4" />
								Table
							</TabsTrigger>
							<TabsTrigger className="flex items-center gap-2" value="dashboard">
								<LayoutDashboard className="h-4 w-4" />
								Dashboard
							</TabsTrigger>
						</TabsList>
						<Button
							className="h-7 text-xs"
							onClick={downloadCSV}
							size="sm"
							variant="outline"
						>
							<Download className="h-3 w-3 mr-1" />
							Export CSV
						</Button>
					</div>
					<TabsContent className="mt-0" value="table">
						<div className="flex items-center justify-between py-2 px-4">
							<Input
								className="h-7 text-xs max-w-sm"
								onChange={(e) => setGlobalFilter(e.target.value)}
								placeholder="Filter logs..."
								value={globalFilter ?? ""}
							/>
						</div>
						<div className="relative">
							<Table>
								<TableHeader className="sticky top-0 bg-white z-10">
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead 
													className="whitespace-nowrap border-b bg-white" 
													key={header.id}
												>
													{header.isPlaceholder ? null : (
														<div
															className={
																header.column.getCanSort()
																	? "cursor-pointer select-none flex items-center"
																	: ""
															}
															onClick={header.column.getCanSort()
																? header.column.getToggleSortingHandler()
																: undefined}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
															{header.column.getIsSorted() === "asc" ? (
																<ArrowUp className="ml-2 h-4 w-4" />
															) : header.column.getIsSorted() === "desc" ? (
																<ArrowDown className="ml-2 h-4 w-4" />
															) : null}
														</div>
													)}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows.length > 0 ? (
										table.getRowModel().rows.map((row) => (
											<TableRow
												className="hover:bg-gray-100 transition-colors"
												key={row.id}
											>
												{row.getVisibleCells().map((cell) => (
													<TableCell className="py-2 px-4 text-xs text-gray-600 whitespace-pre-wrap break-words" key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell className="text-center" colSpan={columns.length}>
												No results found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
						{body?.summary && (
							<div className="p-4 text-gray-500">{body.summary}</div>
						)}
						<div className="p-4 border-t border-gray-200 bg-gray-50">
							<DataTablePagination table={table} />
							{body && (
								<div className="flex justify-end mt-4">
									<Button
										className="hover:bg-gray-100"
										onClick={fetchEventResource}
										size="sm"
										variant="outline"
									>
										Show Complete Log
									</Button>
								</div>
							)}
						</div>
					</TabsContent>
					<TabsContent className="mt-0" value="dashboard">
						<div className="p-4">
							<DashboardViewer resourceId={logId} />
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
};

export default RunningLogViewer;
