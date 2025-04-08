import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getEventResourceRows } from "@/api/eventResourceRoutes";
import { useStore } from "@/utils/store";

interface RunningLogViewerProps {
	logId: string;
	body: {
        entries: {
        id: string;
        row: Record<string, string | number | boolean | null>;
        created_at: string;
        hidden: boolean;
        event_resource_id: string;
    }[];
    summary: string;
}
}

const RunningLogViewer = ({ logId, body }: RunningLogViewerProps) : React.ReactNode => {
	const [tableData, setTableData] = useState<Record<string, any>[]>();
	const [headers, setHeaders] = useState<string[]>([]);
	const session = useStore((state) => state.session);
	useEffect(() => {
		if (body.entries.length > 0) {
			setTableData(body.entries.map((entry) => entry.row));
			setHeaders(Object.keys(body.entries[0].row));
		}
	}, [body]);

	const fetchEventResource = ():void => {
		if (!session) return;
		getEventResourceRows(session, logId).then((eventResource) => {
			if (eventResource) {
				setTableData(eventResource.map((entry) => entry.row));
				setHeaders(Object.keys(eventResource[0].row));
			}
		});
	};

	return (
        
		<div className="rounded-md border border-gray-200 shadow-sm overflow-auto">
			{!tableData || !headers ? (
				<div className="p-4 text-gray-500">Loading...</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50 hover:bg-gray-50">
								{headers.map((header) => (
									<TableHead 
										className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" 
										key={header}
									>
										<div className="flex items-center gap-2">
											<span>{header}</span>
									
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{tableData.map((row, index) => (
								<TableRow 
									className="hover:bg-gray-50 transition-colors"
									key={`${logId}-${index}`}
								>
									{headers.map((header) => (
										<TableCell 
											className="py-2 px-4 text-xs text-gray-600 whitespace-pre-wrap break-words"
											key={header}
										>
											{typeof row[header] === "object" 
												? JSON.stringify(row[header], null, 2) 
												: String(row[header])}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
						<Button 
							className="hover:bg-gray-100" 
							onClick={fetchEventResource}
							size="sm"
							variant="outline"
						>
					        Show Complete Log
						</Button>
			    </div>
				</>
			)}
		</div>
	);
};

export default RunningLogViewer;
