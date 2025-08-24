import React, { useEffect } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { TerminalOutputEvent } from "@/types/computerEvents";

interface MarkdownTerminalProps {
	content: string;
}

const MarkdownTerminal: React.FC<MarkdownTerminalProps> = ({ content }) => {
	const { virtualComputerEventHandler } = useChatStore();

	// Send content directly to virtual computer terminal when content changes
	useEffect(() => {
		if (content && content.trim() && virtualComputerEventHandler) {
			// Create a terminal output event
			const terminalEvent: TerminalOutputEvent = {
				action: "terminal_output",
				timestamp: Date.now(),
				sandbox_id: "external", // Use a placeholder since this comes from external source
				content: content,
				source: "markdown_terminal",
			};
			
			// Send the event to the virtual computer
			virtualComputerEventHandler(terminalEvent);
		}
	}, [content, virtualComputerEventHandler]);
	return (<></>
	);
};

export default MarkdownTerminal;
