import { Button } from "@/components/ui/button";

type ToolbarApi = {
	onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
	onView: (view: string) => void;
	label: string;
	view: string;
};




const CustomToolbar = (toolbar: ToolbarApi): JSX.Element => {
	const goToBack = (): void => {
		toolbar.onNavigate("PREV");
	};

	const goToNext = (): void => {
		toolbar.onNavigate("NEXT");
	};

	const goToCurrent = (): void => {
		toolbar.onNavigate("TODAY");
	};

	return (
		<div className="flex items-center justify-between p-2 bg-background border-b">
			<div className="space-x-2">
				<Button
					onClick={goToBack}
					size="sm"
					variant="outline"
				>
          		Back
				</Button>
				<Button
					onClick={goToCurrent}
					size="sm"
					variant="outline"
				>
          		Today
				</Button>
				<Button
					onClick={goToNext}
					size="sm"
					variant="outline"
				>
          		Next
				</Button>
			</div>
			<div className="text-sm font-medium">{toolbar.label}</div>
			<div className="space-x-2">
				{["month", "week", "day", "agenda"].map((viewOption) => (
					<Button
						className="capitalize"
						key={viewOption}
						onClick={() => toolbar.onView(viewOption)}
						size="sm"
						variant={toolbar.view === viewOption ? "default" : "ghost"}
					>
						{viewOption}
					</Button>
				))}
			</div>
		</div>
	);
};

export default CustomToolbar;