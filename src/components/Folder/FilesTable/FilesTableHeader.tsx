import React from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SortField, SortDirection } from "./types";

interface FilesTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const FilesTableHeader: React.FC<FilesTableHeaderProps> = ({
	sortField,
	sortDirection,
	onSort,
}) => {
	const SortButton = ({
		field,
		children,
	}: {
    field: SortField;
    children: React.ReactNode;
  }) => (
		<Button
			className="hover:bg-transparent"
			onClick={() => onSort(field)}
			variant="ghost"
		>
			{children}
			{sortField === field && (
				<ArrowUpDown
					className={`ml-2 h-4 w-4 ${
						sortDirection === "desc" ? "transform rotate-180" : ""
					}`}
				/>
			)}
		</Button>
	);

	return (
		<TableHeader>
			<TableRow>
				<TableHead className="hidden md:table-cell">
					<SortButton field="file_name">File Name</SortButton>
				</TableHead>
				<TableHead className="hidden sm:table-cell">
					<SortButton field="extension">Type</SortButton>
				</TableHead>
				<TableHead className="hidden md:table-cell">
					<SortButton field="created_at">Date</SortButton>
				</TableHead>
				<TableHead className="hidden md:table-cell">Trash</TableHead>
			</TableRow>
		</TableHeader>
	);
}; 