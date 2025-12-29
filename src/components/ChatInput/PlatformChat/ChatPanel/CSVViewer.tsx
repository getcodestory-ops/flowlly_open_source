import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import { FileText } from "lucide-react";

export const CSVViewer = ({
	resourceId,
	isSandboxFile,
	fileName,
	lastReloadTime,
}: {
  resourceId: string;
  isSandboxFile?: boolean;
  fileName?: string;
  lastReloadTime?: number;
}) => {
	const [csvData, setCsvData] = React.useState<string[][]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const { session } = useStore();
	const { activeProject } = useStore();

	// Using standardized query key: "resource" prefix for all file content fetches
	// Note: Using only project_id instead of full object to prevent unnecessary re-fetches
	const { data: resource, isLoading, isError } = useQuery({
		queryKey: [
			"resource",
			activeProject?.project_id,
			resourceId,
			isSandboxFile ? "sandbox" : "storage",
			fileName,
			lastReloadTime,
		],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return fetchResource(
				session,
				activeProject.project_id,
				resourceId,
				isSandboxFile,
				fileName,
			);
		},
		enabled: !!session && !!activeProject?.project_id && !!resourceId,
		staleTime: 30 * 1000, // Keep data fresh for 30 seconds
	});

	React.useEffect(() => {
		const parseCsvContent = async() => {
			let csvText: string | null = null;

			if (isSandboxFile && typeof resource === "string") {
				csvText = resource;
			} else if ((resource as any)?.metadata?.content) {
				csvText = (resource as any).metadata.content;
			}

			if (!csvText) {
				if (!isLoading && !isError) {
					setError("No CSV content available");
				}
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const lines = csvText.split("\n").filter((line: string) => line.trim());
				const parsedData = lines.map((line: string) => {
					const result: string[] = [];
					let current = "";
					let inQuotes = false;

					for (let i = 0; i < line.length; i++) {
						const char = line[i];
						if (char === "\"") {
							inQuotes = !inQuotes;
						} else if (char === "," && !inQuotes) {
							result.push(current.trim());
							current = "";
						} else {
							current += char;
						}
					}
					result.push(current.trim());
					return result;
				});

				setCsvData(parsedData);
			} catch {
				setError("Failed to parse CSV content");
			} finally {
				setLoading(false);
			}
		};

		parseCsvContent();
	}, [resource, isLoading, isError]);

	if (isLoading || loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-sm text-gray-600">Loading CSV...</div>
			</div>
		);
	}

	if (isError || error) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">
					{error || "Failed to load CSV file"}
				</p>
			</div>
		);
	}

	if (csvData.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">No data found in CSV</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-auto">
			<div className="min-w-full">
				<table className="w-full border-collapse border border-gray-300">
					<thead>
						{csvData.length > 0 && (
							<tr className="bg-gray-50">
								{csvData[0].map((header: string, index: number) => (
									<th
										className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900 sticky top-0 bg-gray-50"
										key={index}
									>
										{header}
									</th>
								))}
							</tr>
						)}
					</thead>
					<tbody>
						{csvData.slice(1).map((row: string[], rowIndex: number) => (
							<tr
								className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
								key={rowIndex}
							>
								{row.map((cell: string, cellIndex: number) => (
									<td
										className="border border-gray-300 px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
										key={cellIndex}
										title={cell}
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default CSVViewer;


