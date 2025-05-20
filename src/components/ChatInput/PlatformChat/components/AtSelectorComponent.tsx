import { useState, useEffect } from "react";
import { AtSign, FileText, Folder, File, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { fetchAtSelector } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";

type Option = {
	name: string;
	id: string;
	extension: string;
};

export default function AtSelectorComponent() : JSX.Element {
	const { session, activeProject, activeChatEntity } = useStore();
	const { setSidePanel, setSelectedContexts, selectedContexts } = useChatStore();
	const currentChatId = activeChatEntity?.id || "untitled";

	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<Option[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Function to get icon based on extension
	const getIconForExtension = (extension: string) => {
		switch (extension.toLowerCase()) {
			case "folder":
				return Folder;
			case "pdf":
				return FileText;
			case "txt":
			case "md":
				return FileText;
			default:
				return File;
		}
	};

	// Function to determine if an option is a file (not a folder)
	const isFile = (extension: string) => extension.toLowerCase() !== "folder";

	// Function to open file in side panel
	const openInSidePanel = (option: Option, e: React.MouseEvent) => {
		e.stopPropagation();
		setSidePanel({
			isOpen: true,
			type: "sources",
			resourceId: option.id,
			filename: option.name,
		});
	};

	// This function will be called when the popover opens
	const fetchOptions = async() => {
		setIsLoading(true);
		try {
			if (!session || !activeProject) {
				return;
			}
			const options = await fetchAtSelector(session, activeProject?.project_id);
			if (Array.isArray(options)) {
				setOptions(options);
			} else {
				console.error("Options is not an array:", options);
				setOptions([]);
			}
		} catch (error) {
			console.error("Error fetching options:", error);
			setOptions([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch options when popover opens
	useEffect(() => {
		if (open) {
			fetchOptions();
		}
	}, [open, session, activeProject]);

	const toggleOption = (id: string) => {
		if (!currentChatId) return;

		const option = options.find((opt) => opt.id === id);
		if (!option) return;

		const currentContexts = selectedContexts[currentChatId] || [];
		const isSelected = currentContexts.some((ctx) => ctx.id === id);
		
		const newContexts = isSelected
			? currentContexts.filter((ctx) => ctx.id !== id)
			: [...currentContexts, { id, name: option.name, extension: option.extension }];

		setSelectedContexts(currentChatId, newContexts);
		setOpen(false);
	};

	const removeOption = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!currentChatId) return;

		const currentContexts = selectedContexts[currentChatId] || [];
		const newContexts = currentContexts.filter((ctx) => ctx.id !== id);
		setSelectedContexts(currentChatId, newContexts);
	};

	return (
		<div className="flex items-center gap-1">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className="h-6 w-6 p-0 hover:bg-accent"
						size="icon"
						variant="ghost"
					>
						<AtSign className="h-4 w-4 text-gray-500" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-[200px] p-0">
					<Command>
						<CommandInput className="font-medium text-gray-500" placeholder="Search..." />
						<CommandList>
							{isLoading ? (
								<div className="py-6 text-center text-sm text-gray-500">Loading...</div>
							) : options.length === 0 ? (
								<div className="py-6 text-center text-sm text-gray-500">No options available</div>
							) : (
								<>
									<CommandEmpty className="font-medium text-gray-500">No results found.</CommandEmpty>
									<CommandGroup>
										{options.map((option) => {
											const Icon = getIconForExtension(option.extension);
											const currentContexts = selectedContexts[currentChatId] || [];
											const isSelected = currentContexts.some((ctx) => ctx.id === option.id);
											return (
												<CommandItem
													className="cursor-pointer font-medium text-gray-500 group"
													key={option.id}
													onSelect={() => toggleOption(option.id)}
												>
													<Icon className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
													<span className="truncate" title={option.name}>{option.name}</span>
													{isFile(option.extension) && (
														<Button
															className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={(e) => openInSidePanel(option, e)}
															size="icon"
															variant="ghost"
														>
															<ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600" />
														</Button>
													)}
												</CommandItem>
											);
										})}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{selectedContexts[currentChatId]?.length > 0 && (
				<div className="flex gap-1">
					{selectedContexts[currentChatId].map((context) => {
						const option = options.find((opt) => opt.id === context.id);
						if (!option) return null;
						const Icon = getIconForExtension(option.extension);
						return (
							<Badge 
								className="h-5 px-2 text-xs font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center gap-1 cursor-pointer max-w-[200px] group"
								key={context.id}
								onClick={(e) => removeOption(context.id, e)}
								variant="secondary"
							>
								<X className="h-3 w-3 text-gray-500 flex-shrink-0" />
								<Icon className="h-3 w-3 text-gray-500 flex-shrink-0" />
								<span className="truncate" title={context.name}>{context.name}</span>
								{isFile(option.extension) && (
									<Button
										className="h-3 w-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => openInSidePanel(option, e)}
										size="icon"
										variant="ghost"
									>
										<ExternalLink className="h-2.5 w-2.5 text-gray-400 hover:text-gray-600" />
									</Button>
								)}
							</Badge>
						);
					})}
				</div>
			)}
		</div>
	);
}

