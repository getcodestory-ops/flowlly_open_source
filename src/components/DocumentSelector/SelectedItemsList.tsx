import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Folder, File, Eye } from "lucide-react";
import { SelectedItemsListProps } from "./types";

export const SelectedItemsList: React.FC<SelectedItemsListProps> = ({
	selectedItems,
	onRemoveItem,
	onOpenInSidePanel,
}) => {
	return (
		<div className="mt-4 space-y-2">
			<Label className="text-sm font-semibold">Selected Items</Label>
			<Card className="border max-h-60 overflow-y-auto p-3">
				<ScrollArea className="h-[100px]">
					{selectedItems.length === 0 ? (
						<div className="text-center text-gray-500">
							No items selected.
						</div>
					) : (
						selectedItems.map((item) => (
							<div
								className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 group"
								key={item.id}
							>
								<div className="flex items-center text-sm flex-1 gap-2">
									<Button
										className="text-red-500 hover:text-red-700 hover:bg-red-50"
										onClick={() => onRemoveItem(item.id)}
										size="sm"
										variant="ghost"
									>
										<X size={12} />
									</Button>
									{item.type === "folder" ? (
										<Folder
											className="text-blue-500 flex-shrink-0"
											size={12}
										/>
									) : (
										<File
											className="text-green-500 flex-shrink-0"
											size={12}
										/>
									)}
									<span className="truncate" title={item.name}>
										{item.name}
									</span>
									{item.type === "file" && onOpenInSidePanel && (
										<Button
											className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
											onClick={(e) => {
												e.stopPropagation();
												onOpenInSidePanel(item.id, item.name);
											}}
											size="sm"
											variant="ghost"
										>
											<Eye className="mr-1" size={12} />
											<span className="text-xs">View</span>
										</Button>
									)}
								</div>
							</div>
						))
					)}
				</ScrollArea>
			</Card>
		</div>
	);
}; 