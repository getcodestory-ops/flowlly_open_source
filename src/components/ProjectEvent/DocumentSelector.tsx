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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
	fetchFolders,
	fetchFiles,
	GetFolderFileProp,
	GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { Folder, File, X, ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";

interface DocumentSelectorProps {
  selectedItems: Array<{ id: string; name: string; type: "folder" | "file" }>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; type: "folder" | "file" }>
    >
  >;
  folderSelectOnly?: boolean;
}

export default function DocumentSelector({
	selectedItems,
	setSelectedItems,
	folderSelectOnly = false,
}: DocumentSelectorProps) {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [isProjectWide, setIsProjectWide] = useState(true);
	const [folderHistory, setFolderHistory] = useState<string[]>([]);
	const [folderDataCache, setFolderDataCache] = useState<{
    [key: string]: {
      folders: GetFolderSubFolderProp[];
      files: GetFolderFileProp[];
    };
  }>({});
	const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});

	const getCacheKey = (folderId: string | null, isProjectWide: boolean) =>
		`${folderId}-${isProjectWide ? "project" : "personal"}`;

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

			const cacheKey = getCacheKey(currentFolderId, isProjectWide);
			if (folderDataCache[cacheKey]) {
				return folderDataCache[cacheKey].folders;
			}

			const folders = await fetchFolders(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);

			setFolderDataCache((prev) => ({
				...prev,
				[cacheKey]: {
					folders,
					files: prev[cacheKey]?.files || [],
				},
			}));

			return folders;
		},
		enabled: !!session && !!activeProject,
	});

	const { data: filesData, isLoading: isFilesLoading } = useQuery({
		queryKey: [
			"files",
			session?.access_token,
			activeProject?.project_id,
			currentFolderId,
			isProjectWide,
		],
		queryFn: async() => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");

			const cacheKey = getCacheKey(currentFolderId, isProjectWide);
			if (folderDataCache[cacheKey]) {
				return folderDataCache[cacheKey].files;
			}

			const files = await fetchFiles(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);

			setFolderDataCache((prev) => ({
				...prev,
				[cacheKey]: {
					folders: prev[cacheKey]?.folders || [],
					files: files || [],
				},
			}));

			return files;
		},
		enabled: !!session && !!activeProject,
	});

	const toggleItemSelection = (item: {
    id: string;
    name: string;
    type: "folder" | "file";
  }) => {
		if (folderSelectOnly && item.type !== "folder") return;
		setSelectedItems((prev) =>
			prev.some((i) => i.id === item.id)
				? prev.filter((i) => i.id !== item.id)
				: [...prev, item],
		);
	};

	const removeSelectedItem = (id: string) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== id));
	};

	const navigateToFolder = (folderId: string | null, folderName?: string) => {
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

	const handleBack = () => {
		const newHistory = [...folderHistory];
		newHistory.pop();
		const previousFolderId = newHistory[newHistory.length - 1] || null;
		setFolderHistory(newHistory);
		setCurrentFolderId(previousFolderId);
	};

	const handleFolderClick = (folder: GetFolderSubFolderProp) => {
		navigateToFolder(folder.id, folder.name);
	};

	const [projectFolderHistory, setProjectFolderHistory] = useState<string[]>(
		[],
	);
	const [personalFolderHistory, setPersonalFolderHistory] = useState<string[]>(
		[],
	);

	const handleScopeChange = (value: string) => {
		const newIsProjectWide = value === "project";
		if (isProjectWide) {
			setProjectFolderHistory(folderHistory);
		} else {
			setPersonalFolderHistory(folderHistory);
		}

		setFolderHistory(
			newIsProjectWide ? projectFolderHistory : personalFolderHistory,
		);
		setCurrentFolderId(null);
		setIsProjectWide(newIsProjectWide);
	};

	return (
		<>
			<div className="space-y-4">
				<Label className="text-sm font-semibold">
          Select Files and Folders
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
							{isFoldersLoading || isFilesLoading ? (
								<div className="text-center text-gray-500">Loading...</div>
							) : (
								<div className="grid grid-cols-1 gap-3">
									{foldersData?.map((folder: GetFolderSubFolderProp) => (
										<div
											className={clsx(
												"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer",
												{
													"bg-gray-100": selectedItems.some(
														(item) => item.id === folder.id,
													),
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
													toggleItemSelection({
														id: folder.id,
														name: folder.name,
														type: "folder",
													});
												}}
												size="sm"
												variant="ghost"
											>
												<Plus size={16} />
											</Button>
										</div>
									))}
									{filesData?.map((folder: GetFolderFileProp) => (
										<div key={folder.id}>
											{folder?.storage_relations?.map((file) => (
												<div key={file.storage_resources?.id}>
													{file.storage_resources && (
														<div
															className={clsx(
																"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer",
																{
																	"bg-gray-100": selectedItems.some(
																		(item) =>
																			item.id === file.storage_resources?.id,
																	),
																},
															)}
														>
															<div className="flex items-center min-w-0 flex-1">
																<File
																	className="mr-2 text-green-500 flex-shrink-0"
																	size={16}
																/>
																<span
																	className="text-sm truncate"
																	title={file.storage_resources?.file_name}
																>
																	{file.storage_resources?.file_name}
																</span>
															</div>
															<Button
																className="flex-shrink-0 ml-2"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleItemSelection({
																		id: file.storage_resources?.id || "",
																		name:
                                      file.storage_resources?.file_name || "",
																		type: "file",
																	});
																}}
																size="sm"
																variant="ghost"
															>
																<Plus size={16} />
															</Button>
														</div>
													)}
												</div>
											))}
										</div>
									))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
			{/* Selected Items Section */}

			<div className="mt-4 space-y-2">
				<Label className="text-sm font-semibold">Selected Items</Label>
				<Card className="border max-h-60 overflow-y-auto p-3">
					<ScrollArea className="h-[200px]">
						{selectedItems.length === 0 ? (
							<div className="text-center text-gray-500">
                No items selected.
							</div>
						) : (
							selectedItems.map((item) => (
								<div
									className="flex items-center justify-between p-2  "
									key={item.id}
								>
									<div className="flex items-center text-sm flex-1">
										<Button
											onClick={() => removeSelectedItem(item.id)}
											size="sm"
											variant="ghost"
										>
											<X size={12} />
										</Button>
										{item.type === "folder" ? (
											<Folder
												className="mr-2 text-blue-500 flex-shrink-0"
												size={12}
											/>
										) : (
											<File
												className="mr-2 text-green-500 flex-shrink-0"
												size={12}
											/>
										)}
										<span className="truncate" title={item.name}>
											{item.name}
										</span>
									</div>
								</div>
							))
						)}
					</ScrollArea>
				</Card>
			</div>
		</>
	);
}
