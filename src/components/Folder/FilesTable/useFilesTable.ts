import { useState, useMemo } from "react";
import { SortField, SortDirection, ExplorerItem } from "./types";

export const useFilesTable = (files: any[], folders: any[], filesPerPage: number = 10) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [searchTerm, setSearchTerm] = useState("");

	// Map files and folders to explorer items
	const explorerItems: ExplorerItem[] = useMemo(() => [
		...folders.map((folder) => ({
			type: "folder" as const,
			name: folder.name,
			created_at: folder.created_at,
			id: folder.id,
		})),
		...files.map((file) => ({
			type: "file" as const,
			name: file.file_name,
			created_at: file.created_at || "",
			id: file.id,
			// Include all StorageResourceEntity properties
			file_name: file.file_name,
			metadata: file.metadata,
			url: file.url,
			project_access_id: file.project_access_id,
			sha: file.sha,
		})),
	], [files, folders]);

	// Sort and filter items
	const sortedAndFilteredItems = useMemo(() => {
		return explorerItems
			.filter(
				(item) =>
					item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.type === "file" &&
            item.metadata?.extension
            	?.toLowerCase()
            	.includes(searchTerm.toLowerCase())),
			)
			.sort((a, b) => {
				// Sort folders before files
				if (a.type !== b.type) {
					return a.type === "folder" ? -1 : 1;
				}

				// Then apply the selected sort
				if (sortField === "file_name") {
					return sortDirection === "asc"
						? a.name.localeCompare(b.name)
						: b.name.localeCompare(a.name);
				}
				if (sortField === "extension") {
					if (a.type === "file" && b.type === "file") {
						const aExt = a.metadata?.extension || "";
						const bExt = b.metadata?.extension || "";
						return sortDirection === "asc"
							? aExt.localeCompare(bExt)
							: bExt.localeCompare(aExt);
					}
					return 0;
				}
				return sortDirection === "asc"
					? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [explorerItems, searchTerm, sortField, sortDirection]);

	// Pagination
	const indexOfLastFile = currentPage * filesPerPage;
	const indexOfFirstFile = indexOfLastFile - filesPerPage;
	const currentItems = sortedAndFilteredItems.slice(indexOfFirstFile, indexOfLastFile);
	const totalPages = Math.ceil(sortedAndFilteredItems.length / filesPerPage);

	// Sort handler
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	return {
		// State
		currentPage,
		sortField,
		sortDirection,
		searchTerm,
    
		// Computed values
		currentItems,
		totalPages,
		indexOfFirstFile,
		indexOfLastFile,
		totalItems: sortedAndFilteredItems.length,
    
		// Actions
		setCurrentPage,
		setSortField,
		setSortDirection,
		setSearchTerm,
		handleSort,
	};
}; 