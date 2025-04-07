import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Folder, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";

interface FolderSelectorProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderName: string) => void;
}

export default function FolderSelector({
	selectedFolderId,
	onFolderSelect,
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

	const handleFolderClick = (folder: GetFolderSubFolderProp) : void=> {
		navigateToFolder(folder.id, folder.name);
	};

	const handleScopeChange = (value: string) : void => {
		const newIsProjectWide = value === "project";
		setCurrentFolderId(null);
		setFolderHistory([]);
		setFolderNames({});
		setIsProjectWide(newIsProjectWide);
	};

	return (
		<div className="space-y-4">
			<Label className="text-sm font-semibold">
        Select Context Folder
			</Label>
			<Card className="border">
				<CardHeader className="flex justify-between items-center">
					<div className="flex items-center gap-2 w-full">
						<Button
							className="flex items-center gap-2"
							disabled={!currentFolderId}
							onClick={handleBack}
							variant="ghost"
						>
							<ArrowLeft size={16} />
						</Button>
						<div className="text-sm text-gray-500 flex-1 min-w-0">
							<div className="truncate">
								{folderHistory.length > 0
									? `/${folderHistory
										.map((id) => folderNames[id])
										.filter(Boolean)
										.join("/")}`
									: "/"}
							</div>
						</div>
						<Select
							onValueChange={handleScopeChange}
							value={isProjectWide ? "project" : "personal"}
						>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder="Select Scope" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="project">Project</SelectItem>
								<SelectItem value="personal">Personal</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[300px]">
						{isFoldersLoading ? (
							<div className="text-center text-gray-500">Loading...</div>
						) : (
							<div className="grid grid-cols-1 gap-3">
								{foldersData?.map((folder: GetFolderSubFolderProp) => (
									<div
										className={clsx(
											"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer",
											{
												"bg-gray-100": selectedFolderId === folder.id,
											},
										)}
										key={folder.id}
										onClick={() => handleFolderClick(folder)}
									>
										<div className="flex items-center min-w-0 flex-1">
											<Folder
												className="mr-2 text-blue-500 flex-shrink-0"
												size={16}
											/>
											<span className="text-sm truncate" title={folder.name}>
												{folder.name}
											</span>
										</div>
										<Button
											className="flex-shrink-0 ml-2"
											onClick={(e) => {
												e.stopPropagation();
												onFolderSelect(folder.id, folder.name);
											}}
											size="sm"
											variant={selectedFolderId === folder.id ? "default" : "outline"}
										>
											{selectedFolderId === folder.id ? "Selected" : "Select"}
										</Button>
									</div>
								))}
							</div>
						)}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
} 