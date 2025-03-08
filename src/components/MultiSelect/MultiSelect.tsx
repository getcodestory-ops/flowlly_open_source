import React, { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { set } from "date-fns";

interface MultiSelectProps {
  title: string;
  options: {
    id: string;
    label: string;
  }[];
  onChange?: (selected: string[]) => void;
  existingSelection?: string[];
}

const MultiSelect = ({
	title,
	options,
	onChange = () => {},
	existingSelection = [],
}: MultiSelectProps) => {
	const [open, setOpen] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

	useEffect(() => {
		if (existingSelection) setSelectedOptions(existingSelection);
	}, [existingSelection]);

	const handleSelect = (optionId: string) => {
		const updatedSelection = selectedOptions?.includes(optionId)
			? selectedOptions.filter((id) => id !== optionId)
			: [...selectedOptions, optionId];
		setSelectedOptions(updatedSelection);
		onChange(updatedSelection);
	};

	const handleClear = () => {
		setSelectedOptions([]);
		onChange([]);
	};

	const handleSelectAll = () => {
		const allIds = options.map((option) => option.id);
		setSelectedOptions(allIds);
		onChange(allIds);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className="w-full justify-between"
					role="combobox"
					variant="outline"
				>
					{title}
					<Badge className="ml-2" variant="secondary">
						{selectedOptions?.length}
					</Badge>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="">
				<Command>
					<CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
					<CommandEmpty>No option found.</CommandEmpty>
					<CommandGroup>
						<div className="flex justify-between p-2">
							<Button
								className="text-xs"
								onClick={handleSelectAll}
								size="sm"
								variant="ghost"
							>
                Select All
							</Button>
							<Button
								className="text-xs"
								onClick={handleClear}
								size="sm"
								variant="ghost"
							>
                Clear
							</Button>
						</div>
						<ScrollArea className="flex max-h-96 flex-col overflow-y-auto ">
							<div className="mr-6">
								{options &&
                  options.map((option) => (
                  	<CommandItem
                  		key={option.id}
                  		onSelect={() => handleSelect(option.id)}
                  	>
                  		<Check
                  			className={cn(
                  				"mr-2 h-4 w-4",
                  				selectedOptions?.includes(option.id)
                  					? "opacity-100"
                  					: "opacity-0",
                  			)}
                  		/>
                  		{option.label}
                  	</CommandItem>
                  ))}
							</div>
						</ScrollArea>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default MultiSelect;
