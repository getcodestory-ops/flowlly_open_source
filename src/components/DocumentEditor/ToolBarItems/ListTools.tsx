import React from "react";
import { FaListUl, FaListOl } from "react-icons/fa";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

interface ListToolsProps {
	editor: Editor;
}

const ListTools: React.FC<ListToolsProps> = ({ editor }) => {
	return (
		<>
			<ToolTipedButton
				onClick={() => editor.chain().focus()
					.toggleBulletList()
					.run()}
				tooltip="Bullet List"
			>
				<FaListUl />
			</ToolTipedButton>
			<ToolTipedButton
				onClick={() => editor.chain().focus()
					.toggleOrderedList()
					.run()}
				tooltip="Ordered List"
			>
				<FaListOl />
			</ToolTipedButton>
		</>
	);
};

export default ListTools; 