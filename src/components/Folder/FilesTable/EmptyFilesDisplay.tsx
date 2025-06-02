import React from "react";
import { FileSearch } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

export const EmptyFilesDisplay: React.FC = () => {
	return (
		<TableRow>
			<TableCell className="text-center flex flex-col items-center justify-center pt-8" colSpan={4}>
				<div className="flex flex-col items-center justify-center pt-8">
					<FileSearch className="w-10 h-10 text-gray-400 mb-4" />
					<p className="text-lg font-medium text-gray-500">No files found</p>
					<p className="text-sm text-gray-400">
            It looks like there are no files here. Try uploading or checking back
            later.
					</p>
				</div>
			</TableCell>
		</TableRow>
	);
}; 