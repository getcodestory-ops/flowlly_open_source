import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ViewMode } from "gantt-task-react";
import { Separator } from "@/components/ui/separator";

type ViewSwitcherProps = {
  isChecked: boolean;
  onViewListChange: (isChecked: boolean) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  View: string;
};
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
	onViewModeChange,
	onViewListChange,
	isChecked,
	View,
}) => {
	return (
		<div className="ViewContainer flex gap-2 h-8 ">
			<Separator orientation="vertical" />
			{/* <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.Hour)}
      >
        Hour
      </button> */}
			{/* <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.QuarterDay)}
      >
        Quarter of Day
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.HalfDay)}
      >
        Half of Day
      </button> */}
			<Button
				onClick={() => onViewModeChange(ViewMode.Day)}
				size="sm"
				variant={View === "Day" ? "default" : "outline"}
			>
        Day
			</Button>
			<Button
				onClick={() => onViewModeChange(ViewMode.Week)}
				size="sm"
				variant={View === "Week" ? "default" : "outline"}
			>
        Week
			</Button>
			<Button
				onClick={() => onViewModeChange(ViewMode.Month)}
				size="sm"
				variant={View === "Month" ? "default" : "outline"}
			>
        Month
			</Button>
			<Button
				onClick={() => onViewModeChange(ViewMode.Year)}
				size="sm"
				variant={View === "Year" ? "default" : "outline"}
			>
        Year
			</Button>
			{/* <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.QuarterYear)}
      >
        Year
      </button> */}
			<Separator orientation="vertical" />
			<div className="flex items-center space-x-2">
				<Checkbox
					defaultChecked={isChecked}
					id="terms"
					onClick={() => onViewListChange(!isChecked)}
				/>
				<label
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					htmlFor="terms"
				>
          Show Task List
				</label>
			</div>
		</div>
	);
};
