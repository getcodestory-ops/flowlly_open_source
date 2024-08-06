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
        variant={View === "Day" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange(ViewMode.Day)}
      >
        Day
      </Button>
      <Button
        variant={View === "Week" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange(ViewMode.Week)}
      >
        Week
      </Button>
      <Button
        variant={View === "Month" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange(ViewMode.Month)}
      >
        Month
      </Button>
      <Button
        variant={View === "Year" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange(ViewMode.Year)}
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
          id="terms"
          onClick={() => onViewListChange(!isChecked)}
          defaultChecked={isChecked}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show Task List
        </label>
      </div>
    </div>
  );
};
