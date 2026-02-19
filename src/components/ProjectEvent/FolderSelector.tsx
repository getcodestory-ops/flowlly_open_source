import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders, GetFolderSubFolderProp } from "@/api/folderRoutes";
import { Folder, ArrowLeft, Check, ChevronRight, Loader2, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface FolderSelectorProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderName: string) => void;
  hideLabel?: boolean;
  label?: string;
}

export default function FolderSelector({
	selectedFolderId,
	onFolderSelect,
	hideLabel = false,
	label,
}: FolderSelectorProps) :React.ReactNode {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [isProjectWide, setIsProjectWide] = useState(true);
	const [folderHistory, setFolderHistory] = useState<string[]>([]);
	const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});

	const { data: foldersData, isLoading: isFoldersLoading } = useQuery({
		queryKey: [
			"folders",
			session?.access_token,
			activeProject?.project_id,
			currentFolderId,
			isProjectWide,
		],
		queryFn: async() => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");

			return fetchFolders(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);
		},
		enabled: !!session && !!activeProject,
	});

	const navigateToFolder = (folderId: string | null, folderName?: string) : void => {
		if (folderId === null) {
			setFolderHistory([]);
			setFolderNames({});
		} else {
			setFolderHistory((prev) => [...prev, folderId]);
			if (folderName) {
				setFolderNames((prev) => ({ ...prev, [folderId]: folderName }));
			}
		}
		setCurrentFolderId(folderId);
	};

	const handleBack = () : void => {
		const newHistory = [...folderHistory];
		newHistory.pop();
		const previousFolderId = newHistory[newHistory.length - 1] || null;
		setFolderHistory(newHistory);
		setCurrentFolderId(previousFolderId);
	};

	const handleFolderSelect = (folder: GetFolderSubFolderProp) : void => {
		onFolderSelect(folder.id, folder.name);
	};

	const handleFolderDoubleClick = (folder: GetFolderSubFolderProp) : void => {
		navigateToFolder(folder.id, folder.name);
	};

	const handleScopeChange = (value: string) : void => {
		const newIsProjectWide = value === "project";
		setCurrentFolderId(null);
		setFolderHistory([]);
		setFolderNames({});
		setIsProjectWide(newIsProjectWide);
	};

	const currentFolderName = currentFolderId 
		? folderNames[currentFolderId] 
		: (isProjectWide ? "Project Files" : "Personal Files");

	return (
		<div className="space-y-3">
			{!hideLabel && (
				<Label className="text-sm font-semibold">
					{label || "Select Folder to save files"}
				</Label>
			)}
			<Card className="border rounded-xl overflow-hidden shadow-sm">
				{/* Header with navigation */}
				<CardHeader className="py-3 px-4 bg-gray-50/80 border-b">
					<div className="flex items-center gap-2 w-full">
						<Button
							className="h-8 w-8 p-0 flex-shrink-0"
							disabled={!currentFolderId}
							onClick={handleBack}
							size="sm"
							variant="ghost"
						>
							<ArrowLeft size={16} />
						</Button>
						<div className="flex items-center gap-1 flex-1 min-w-0 text-sm">
							<Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
							<span className="text-gray-600 truncate font-medium">
								{currentFolderName}
							</span>
							{folderHistory.length > 0 && (
								<span className="text-gray-400 text-xs ml-1">
									({folderHistory.length} level{folderHistory.length > 1 ? "s" : ""} deep)
								</span>
							)}
						</div>
						<Select
							onValueChange={handleScopeChange}
							value={isProjectWide ? "project" : "personal"}
						>
							<SelectTrigger className="w-[110px] h-8 text-xs">
								<SelectValue placeholder="Scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="project">Project</SelectItem>
								<SelectItem value="personal">Personal</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>

				{/* Folder list */}
				<CardContent className="p-0">
					<ScrollArea className="h-[280px]">
						<div className="p-2">
							{isFoldersLoading ? (
								<div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
									<Loader2 className="h-8 w-8 animate-spin mb-2" />
									<span className="text-sm">Loading folders...</span>
								</div>
							) : foldersData && foldersData.length > 0 ? (
								<div className="space-y-1">
									{foldersData.map((folder: GetFolderSubFolderProp) => {
										const isSelected = selectedFolderId === folder.id;
										return (
											<div
												className={clsx(
													"flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 select-none group",
													isSelected
														? "bg-blue-50 ring-2 ring-blue-500 ring-inset shadow-sm"
														: "hover:bg-gray-100",
												)}
												key={folder.id}
												onClick={() => handleFolderSelect(folder)}
												onDoubleClick={() => handleFolderDoubleClick(folder)}
											>
												{isSelected ? (
													<FolderOpen className="text-blue-600 flex-shrink-0" size={20} />
												) : (
													<Folder className="text-amber-500 flex-shrink-0 group-hover:text-amber-600" size={20} />
												)}
												<span 
													className={clsx(
														"text-sm truncate flex-1 font-medium",
														isSelected ? "text-blue-700" : "text-gray-700"
													)} 
													title={folder.name}
												>
													{folder.name}
												</span>
												{isSelected ? (
													<Check className="text-blue-600 flex-shrink-0" size={18} />
												) : (
													<ChevronRight 
														className="text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
														size={16} 
													/>
												)}
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
									<Folder className="h-12 w-12 mb-2 text-gray-300" />
									<span className="text-sm font-medium">No folders here</span>
									<span className="text-xs text-gray-400">This folder is empty</span>
								</div>
							)}
						</div>
					</ScrollArea>
				</CardContent>

				{/* Footer hint */}
				<div className="px-4 py-2 bg-gray-50/50 border-t text-xs text-gray-400 text-center">
					Click to select • Double-click to open folder
				</div>
			</Card>
		</div>
	);
} 