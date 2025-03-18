import { Button } from "@/components/ui/button";
import { Calendar, Grid, List } from "lucide-react";
import { ViewMode } from "./types";

export const WorkflowViewModeSwitcher = ({ viewMode, setViewMode }: { viewMode: ViewMode, setViewMode: (_: ViewMode) => void }): React.ReactNode => {
	return (
		<div className="flex items-center gap-1">
			<Button
				onClick={() => setViewMode(ViewMode.GRID)}
				size="icon"
				variant={viewMode === ViewMode.GRID ? "default" : "outline"}
			>
				<Grid className="h-4 w-4" />
			</Button>
			<Button
				onClick={() => setViewMode(ViewMode.LIST)}
				size="icon"
				variant={viewMode === ViewMode.LIST ? "default" : "outline"}
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				onClick={() => setViewMode(ViewMode.CALENDAR)}
				size="icon"
				variant={viewMode === ViewMode.CALENDAR ? "default" : "outline"}
			>
				<Calendar className="h-4 w-4" />
			</Button>
		</div>
	);
};