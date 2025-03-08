import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	WorkflowNode,
	DocumentExtractionNodeConfig,
	NodeType,
	NodeStatus,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, File, Folder } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import DocumentSelector from "@/components/ProjectEvent/DocumentSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentExtractionNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

const dataTypes = ["string", "number", "date", "boolean"];

export function DocumentExtractionNode({
	onSave,
	onCancel,
	editingNode,
}: DocumentExtractionNodeProps) {
	const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; name: string; type: "folder" | "file" }>
  >([]);
	const [config, setConfig] = useState<DocumentExtractionNodeConfig>({
		extractionPrompt: "",
		columns: [],
		selectedItems: [],
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.DOCUMENT_EXTRACTION) {
			setConfig(editingNode.config as DocumentExtractionNodeConfig);
		}
	}, [editingNode]);

	const addColumn = () => {
		setConfig((prev) => ({
			...prev,
			columns: [
				...prev.columns,
				{ name: "", description: "", dataType: "string", optional: false },
			],
		}));
	};

	const removeColumn = (index: number) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.filter((_, idx) => idx !== index),
		}));
	};

	const updateColumn = (
		index: number,
		field: keyof (typeof config.columns)[0],
		value: string | boolean,
	) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.map((col, idx) =>
				idx === index ? { ...col, [field]: value } : col,
			),
		}));
	};

	const removeSelectedItem = (id: string) => {
		setConfig((prev) => ({
			...prev,
			selectedItems: prev.selectedItems.filter((item) => item.id !== id),
		}));
	};

	useEffect(() => {
		setConfig((prev) => ({ ...prev, selectedItems }));
	}, [selectedItems]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label>Extraction Prompt</Label>
					<Textarea
						className="min-h-[100px]"
						onChange={(e) =>
							setConfig((prev) => ({
								...prev,
								extractionPrompt: e.target.value,
							}))
						}
						placeholder="Describe what data to extract and how to structure it..."
						value={config.extractionPrompt}
					/>
				</div>
				<div className="space-y-2">
					<Label>Select Source Documents</Label>
					<div className="flex gap-2 items-center">
						<Button
							className="flex-1"
							onClick={() => setIsDocumentSelectorOpen(true)}
							variant="outline"
						>
							{config.selectedItems.length > 0
								? `${config.selectedItems.length} item${
									config.selectedItems.length > 1 ? "s" : ""
								} selected`
								: "Select files and folders"}
						</Button>
					</div>
					{config.selectedItems.length > 0 && (
						<Card className="border p-3">
							<ScrollArea className="h-[100px]">
								{config.selectedItems.map((item) => (
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
				<div className="space-y-4">
					<Label>Extraction Schema</Label>
					{config.columns.map((column, index) => (
						<div className="flex gap-4 items-start" key={index}>
							<div className="flex-1 space-y-2">
								<Label>Column Name</Label>
								<Input
									onChange={(e) => updateColumn(index, "name", e.target.value)}
									placeholder="Enter column name..."
									value={column.name}
								/>
							</div>
							<div className="flex-1 space-y-2">
								<Label>Description</Label>
								<Input
									onChange={(e) =>
										updateColumn(index, "description", e.target.value)
									}
									placeholder="Enter description..."
									value={column.description}
								/>
							</div>
							<div className="space-y-2">
								<Label>Data Type</Label>
								<Select
									onValueChange={(value: any) =>
										updateColumn(index, "dataType", value)
									}
									value={column.dataType}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{dataTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex-1 space-y-2">
								<Label>Optional</Label>
								<div className="flex items-center space-x-2">
									<Checkbox
										checked={column.optional}
										onCheckedChange={(checked) =>
											updateColumn(index, "optional", checked)
										}
									/>
								</div>
							</div>
							<Button
								onClick={() => removeColumn(index)}
								size="icon"
								type="button"
								variant="ghost"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
					<Button
						className="w-full"
						onClick={addColumn}
						type="button"
						variant="outline"
					>
						<PlusCircle className="h-4 w-4 mr-2" />
            Add Column
					</Button>
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
						disabled={
							!config.extractionPrompt ||
              config.columns.length === 0 ||
              config.selectedItems.length === 0
						}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.DOCUMENT_EXTRACTION,
								title: "Document Extraction",
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
