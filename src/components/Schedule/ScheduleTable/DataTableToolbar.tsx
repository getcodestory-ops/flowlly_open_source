import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/Schedule/ScheduleTable/DataTableViewOptions";
import { CalendarIcon } from "@radix-ui/react-icons";
import { statuses } from "./Data/data";
import { DataTableFacetedFilter } from "@/components/Schedule/ScheduleTable/DataTableFacetedFilter";
import { format } from "date-fns";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
	table,
}: DataTableToolbarProps<TData>) {
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date());
	const isFiltered = table.getState().columnFilters.length > 0;

	// useEffect(() => {

	//   setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));

	//   table.getColumn("start")?.setFilterValue(format(startDate, "yyyy-MM-dd"));

	//   setEndDate(new Date(new Date().setDate(new Date().getDate() + 7)));
	//   table.getColumn("end")?.setFilterValue(format(endDate, "yyyy-MM-dd"));
	// }, []);

	return (
		<div className="flex items-center justify-between ">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					className="h-8 w-[150px] lg:w-[250px]"
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					placeholder="Filter tasks..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
				/>
				{/* The table has start and end dates columns add calendar input to filter by date */}
				<div className="flex items-center">
					<div className="mx-2">From</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className={`w-[200px] justify-start text-left font-normal ${
									!startDate && "text-muted-foreground"
								}`}
								variant="outline"
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDate ? (
									format(startDate, "PPP")
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-auto p-0">
							<Calendar
								mode="single"
								onSelect={(newDate) => {
									newDate && setStartDate(newDate);
									table.getColumn("start")?.setFilterValue({
										start: newDate ? format(newDate, "yyyy-MM-dd") : undefined,
										end: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
									});
								}}
								selected={startDate}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex items-center">
					<div className="mx-2 text-sm">To</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className={`w-[200px] justify-start text-left font-normal  ${
									!endDate && "text-muted-foreground"
								}`}
								variant="outline"
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDate ? format(endDate, "PPP") : <span>Pick a date</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-auto p-0">
							<Calendar
								mode="single"
								onSelect={(newDate) => {
									newDate && setEndDate(newDate);
									table.getColumn("end")?.setFilterValue({
										start: startDate
											? format(startDate, "yyyy-MM-dd")
											: undefined,
										end: newDate ? format(newDate, "yyyy-MM-dd") : undefined,
									});
								}}
								selected={endDate}
							/>
						</PopoverContent>
					</Popover>
				</div>
				{table.getColumn("status") && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						options={statuses}
						title="Status"
					/>
				)}
				{/* {table.getColumn("owner") && (
          <DataTableFacetedFilter
            column={table.getColumn("owner")}
            title="Owner"
            options={priorities}
          />
        )} */}
				{isFiltered && (
					<Button
						className="h-8 px-2 lg:px-3"
						onClick={() => table.resetColumnFilters()}
						variant="ghost"
					>
            Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
