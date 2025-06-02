import React from "react";
import { DocumentSelector as RefactoredDocumentSelector } from "@/components/DocumentSelector";
import { DocumentSelectorProps } from "@/components/DocumentSelector/types";

// Legacy interface for backward compatibility
interface LegacyDocumentSelectorProps {
  selectedItems?: Array<{ id: string; name: string; type: "folder" | "file" }>;
  setSelectedItems?: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; type: "folder" | "file" }>
    >
  >;
  folderSelectOnly?: boolean;
  useChatContext?: boolean;
}

export default function DocumentSelector(props: LegacyDocumentSelectorProps) {
	// Convert legacy props to new format
	const documentSelectorProps: DocumentSelectorProps = {
		selectedItems: props.selectedItems,
		setSelectedItems: props.setSelectedItems,
		folderSelectOnly: props.folderSelectOnly,
		useChatContext: props.useChatContext,
	};

	return <RefactoredDocumentSelector {...documentSelectorProps} />;
}
