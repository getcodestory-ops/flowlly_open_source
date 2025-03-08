import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	WorkflowNode,
	DocumentSelectionNodeConfig,
	NodeType,
	NodeStatus,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { File, Folder, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import DocumentSelector from "@/components/ProjectEvent/DocumentSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentSelectionNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function DocumentSelectionNode({
	onSave,
	onCancel,
	editingNode,
}: DocumentSelectionNodeProps) {
	const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; name: string; type: "folder" | "file" }>
  >([]);
	const [config, setConfig] = useState<DocumentSelectionNodeConfig>({
		selectedItems: [],
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.DOCUMENT_SELECTION) {
			setConfig(editingNode.config as DocumentSelectionNodeConfig);
			setSelectedItems(editingNode.config.selectedItems);
		}
	}, [editingNode]);

	const removeSelectedItem = (id: string) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== id));
	};

	useEffect(() => {
		setConfig((prev) => ({ ...prev, selectedItems }));
	}, [selectedItems]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label>Select Source Documents</Label>
					<div className="flex gap-2 items-center">
						<Button
							className="flex-1"
							onClick={() => setIsDocumentSelectorOpen(true)}
							variant="outline"
						>
							{selectedItems.length > 0
								? `${selectedItems.length} item${
									selectedItems.length > 1 ? "s" : ""
								} selected`
								: "Select files and folders"}
						</Button>
					</div>
					{selectedItems.length > 0 && (
						<Card className="border p-3">
							<ScrollArea className="h-[100px]">
								{selectedItems.map((item) => (
									<div
										className="flex items-center justify-between p-2"
										key={item.id}
									>
										<div className="flex items-center text-sm flex-1">
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
										<Button
											onClick={() => removeSelectedItem(item.id)}
											size="sm"
											variant="ghost"
										>
											<Trash2 size={12} />
										</Button>
									</div>
								))}
							</ScrollArea>
						</Card>
					)}
				</div>
				<div className="flex justify-end space-x-2">
					<Button
						onClick={onCancel}
						type="button"
						variant="outline"
					>
            Cancel
					</Button>
					<Button
						disabled={selectedItems.length === 0}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.DOCUMENT_SELECTION,
								title: "Document Selection",
								config,
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
							});
						}}
						type="button"
					>
						{editingNode ? "Update" : "Add"} Node
					</Button>
				</div>
			</CardContent>
			<Dialog
				onOpenChange={setIsDocumentSelectorOpen}
				open={isDocumentSelectorOpen}
			>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Select Files and Folders</DialogTitle>
					</DialogHeader>
					<DocumentSelector
						selectedItems={selectedItems}
						setSelectedItems={setSelectedItems}
					/>
					<DialogFooter>
						<Button onClick={() => setIsDocumentSelectorOpen(false)}>
              Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
