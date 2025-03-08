import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { fetchFolders, GetFolderSubFolderProp } from "@/api/folderRoutes";
import { Folder, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";

interface FolderBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string) => void;
  selectedItems?: Array<{ id: string; name: string; type: "folder" | "file" }>;
}

export default function FolderBrowserModal({
	isOpen,
	onClose,
	onSelect,
	selectedItems = [],
}: FolderBrowserModalProps) {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [folderHistory, setFolderHistory] = useState<string[]>([]);
	const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});
	const [isProjectWide, setIsProjectWide] = useState(true);
	const [projectFolderHistory, setProjectFolderHistory] = useState<string[]>(
		[],
	);
	const [personalFolderHistory, setPersonalFolderHistory] = useState<string[]>(
		[],
	);
	const [projectFolderNames, setProjectFolderNames] = useState<{
    [key: string]: string;
  }>({});
	const [personalFolderNames, setPersonalFolderNames] = useState<{
    [key: string]: string;
  }>({});

	const { data: foldersData, isLoading } = useQuery({
		queryKey: [
			"folderBrowser",
			session?.access_token,
			activeProject?.project_id,
			currentFolderId,
			isProjectWide,
		],
		queryFn: () => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");
			return fetchFolders(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);
		},
		enabled: !!session && !!activeProject && isOpen,
	});

	const navigateToFolder = (folderId: string | null, folderName?: string) => {
		if (folderId === null) {
			setFolderHistory([]);
			if (isProjectWide) {
				setProjectFolderNames({});
			} else {
				setPersonalFolderNames({});
			}
		} else {
			setFolderHistory((prev) => [...prev, folderId]);
			if (folderName) {
				if (isProjectWide) {
					setProjectFolderNames((prev) => ({
						...prev,
						[folderId]: folderName,
					}));
				} else {
					setPersonalFolderNames((prev) => ({
						...prev,
						[folderId]: folderName,
					}));
				}
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

	const handleSelect = (
		folder: GetFolderSubFolderProp,
		e?: React.MouseEvent,
	) => {
		e?.preventDefault();
		e?.stopPropagation();
		onSelect(folder.id, folder.name);
		onClose();
	};

	const handleScopeChange = (value: string) => {
		const newIsProjectWide = value === "project";

		if (isProjectWide) {
			setProjectFolderHistory(folderHistory);
			setProjectFolderNames(folderNames);
		} else {
			setPersonalFolderHistory(folderHistory);
			setPersonalFolderNames(folderNames);
		}

		setFolderHistory(
			newIsProjectWide ? projectFolderHistory : personalFolderHistory,
		);
		setFolderNames(newIsProjectWide ? projectFolderNames : personalFolderNames);
		setCurrentFolderId(null);
		setIsProjectWide(newIsProjectWide);
	};

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Select Output Folder</DialogTitle>
				</DialogHeader>
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
				<ScrollArea className="h-[300px] w-full">
					{isLoading ? (
						<div className="text-center text-gray-500">Loading...</div>
					) : (
						<div className="grid grid-cols-1 gap-2">
							{foldersData?.map((folder: GetFolderSubFolderProp) => (
								<div
									className={clsx(
										"flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md",
										{
											"bg-gray-100": selectedItems.some(
												(item) => item.id === folder.id,
											),
										},
									)}
									key={folder.id}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										navigateToFolder(folder.id, folder.name);
									}}
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
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleSelect(folder, e);
										}}
										size="sm"
										variant="ghost"
									>
										{selectedItems.some((item) => item.id === folder.id)
											? "Selected"
											: "Select"}
									</Button>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
				<DialogFooter>
					<Button onClick={onClose}>Done</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
