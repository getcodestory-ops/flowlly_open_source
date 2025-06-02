import { useState, useMemo } from "react";
import { StorageResourceEntity } from "@/types/document";
import { GetFolderSubFolderProp } from "@/api/folderRoutes";
import { SortField, SortDirection, DocumentSelectorItem, SelectedItem } from "./types";

export const useDocumentSelector = (
	files: StorageResourceEntity[], 
	folders: GetFolderSubFolderProp[],
	selectedItems: SelectedItem[],
	folderSelectOnly: boolean = false,
	itemsPerPage: number = 10,
) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [searchTerm, setSearchTerm] = useState("");

	// Map files and folders to unified items
	const selectorItems: DocumentSelectorItem[] = useMemo(() => [
		...folders.map((folder) => ({
			id: folder.id,
			name: folder.name,
			type: "folder" as const,
			created_at: folder.created_at,
		})),
		...files.map((file) => ({
			id: file.id,
			name: file.file_name || "",
			type: "file" as const,
			created_at: file.created_at || "",
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
		return selectorItems
			.filter((item) => {
				const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.type === "file" && item.metadata?.extension?.toLowerCase().includes(searchTerm.toLowerCase()));
        
				// If folder select only, filter out files
				if (folderSelectOnly && item.type === "file") {
					return false;
				}
        
				return matchesSearch;
			})
			.sort((a, b) => {
				// Sort folders before files
				if (a.type !== b.type) {
					return a.type === "folder" ? -1 : 1;
				}

				// Then apply the selected sort
				if (sortField === "name") {
					return sortDirection === "asc"
						? a.name.localeCompare(b.name)
						: b.name.localeCompare(a.name);
				}
				if (sortField === "type") {
					if (a.type === "file" && b.type === "file") {
						const aExt = a.metadata?.extension || "";
						const bExt = b.metadata?.extension || "";
						return sortDirection === "asc"
							? aExt.localeCompare(bExt)
							: bExt.localeCompare(aExt);
					}
					return 0;
				}
				// Sort by created_at
				return sortDirection === "asc"
					? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [selectorItems, searchTerm, sortField, sortDirection, folderSelectOnly]);

	// Pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = sortedAndFilteredItems.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);

	// Sort handler
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Check if item is selected
	const isItemSelected = (itemId: string) => {
		return selectedItems.some((item) => item.id === itemId);
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
		indexOfFirstItem,
		indexOfLastItem,
		totalItems: sortedAndFilteredItems.length,
    
		// Actions
		setCurrentPage,
		setSortField,
		setSortDirection,
		setSearchTerm,
		handleSort,
		isItemSelected,
	};
}; 