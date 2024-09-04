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
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(existingSelection);

  useEffect(() => {
    setSelectedOptions(existingSelection);
  }, [existingSelection]);

  const handleSelect = (optionId: string) => {
    const updatedSelection = selectedOptions.includes(optionId)
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {title}
          <Badge variant="secondary" className="ml-2">
            {selectedOptions.length}
          </Badge>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            <div className="flex justify-between p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                onSelect={() => handleSelect(option.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedOptions.includes(option.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
