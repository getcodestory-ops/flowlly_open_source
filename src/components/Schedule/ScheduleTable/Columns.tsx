import { ColumnDef } from "@tanstack/react-table";

import { ActivityEntityWithMembers } from "@/utils/mapOwnerToMembers";
import { DataTableColumnHeader } from "@/components/Schedule/ScheduleTable/DataTableColumnHeader";
import { MemberEntity } from "@/types/members";

export const columns: ColumnDef<ActivityEntityWithMembers>[] = [
	// {
	//   id: "select",
	//   header: ({ table }) => (
	//     <Checkbox
	//       checked={
	//         table.getIsAllPageRowsSelected() ||
	//         (table.getIsSomePageRowsSelected() && "indeterminate")
	//       }
	//       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
	//       aria-label="Select all"
	//       className="translate-y-[2px]"
	//     />
	//   ),
	//   cell: ({ row }) => (
	//     <Checkbox
	//       checked={row.getIsSelected()}
	//       onCheckedChange={(value) => row.toggleSelected(!!value)}
	//       aria-label="Select row"
	//       className="translate-y-[2px]"
	//     />
	//   ),
	//   enableSorting: false,
	//   enableHiding: false,
	// },

	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const hasHistory =
        Array.isArray(row.original.history) &&
        row.original.history.length > 0 &&
        row.original.history[0] !== null;

			return (
				<div
					className={`flex space-x-2 w-[500px] ${
						hasHistory ? "bg-yellow-100" : ""
					}`}
				>
					<span className="w-[500px] font-medium truncate ">
						{row.getValue("name")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "owner",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Owner" />
		),
		cell: ({ row }) => {
			const owners = row.getValue("owner") as MemberEntity[];
			return (
				<div className="flex space-x-2 ">
					<span className=" truncate ">
						{owners.map((owner) => owner.first_name)}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex w-[120px] items-center">
					<span>{row.getValue("status")}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "start",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Start" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center w-[120px]">
					<span>{row.getValue("start")}</span>
				</div>
			);
		},
		filterFn: (row, id, filterValue) => {
			if (!filterValue) return true;
			const activityStart = new Date(row.getValue("start"));
			const activityEnd = new Date(row.getValue("end"));
			const filterStart = filterValue.start
				? new Date(filterValue.start)
				: new Date(-8640000000000000); // Earliest date
			const filterEnd = filterValue.end
				? new Date(filterValue.end)
				: new Date(8640000000000000); // Latest date

			return activityStart <= filterEnd && activityEnd >= filterStart;
		},
	},
	{
		accessorKey: "end",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="End" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center w-[120px]">
					<span>{row.getValue("end")}</span>
				</div>
			);
		},
		filterFn: (row, id, filterValue) => {
			if (!filterValue) return true;
			const activityStart = new Date(row.getValue("start"));
			const activityEnd = new Date(row.getValue("end"));
			const filterStart = filterValue.start
				? new Date(filterValue.start)
				: new Date(-8640000000000000); // Earliest date
			const filterEnd = filterValue.end
				? new Date(filterValue.end)
				: new Date(8640000000000000); // Latest date

			return activityStart <= filterEnd && activityEnd >= filterStart;
		},
	},
	// {
	//   id: "actions",
	//   cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
