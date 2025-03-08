import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface AuthorizedUserSelectorProps {
  members: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  }[];
  selectedUsers: string[];
  onChange: (selectedUsers: string[]) => void;
}

export function AuthorizedUserSelector({
	members,
	selectedUsers,
	onChange,
}: AuthorizedUserSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleSelect = (userId: string) => {
		if (selectedUsers.includes(userId)) {
			onChange(selectedUsers.filter((id) => id !== userId));
		} else {
			onChange([...selectedUsers, userId]);
		}
	};

	const handleRemove = (userId: string) => {
		onChange(selectedUsers.filter((id) => id !== userId));
	};

	return (
		<div className="space-y-2">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						aria-expanded={open}
						className="w-full justify-between"
						role="combobox"
						variant="outline"
					>
            Select users...
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search users..." />
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{members.map((member) => (
								<CommandItem
									key={member.id}
									onSelect={() => handleSelect(member.id)}
									value={member.id}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											selectedUsers.includes(member.id)
												? "opacity-100"
												: "opacity-0",
										)}
									/>
									<div className="flex flex-col">
										<span>
											{member.firstName} {member.lastName}
										</span>
										<span className="text-sm text-muted-foreground">
											{member.email}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			<div className="flex flex-wrap gap-2">
				{selectedUsers.map((userId) => {
					const member = members.find((m) => m.id === userId);
					if (!member) return null;

					return (
						<Badge
							className="flex items-center gap-1"
							key={userId}
							variant="secondary"
						>
							<span>
								{member.firstName} {member.lastName} ({member.email})
							</span>
							<Button
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => handleRemove(userId)}
								size="icon"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					);
				})}
			</div>
		</div>
	);
}
