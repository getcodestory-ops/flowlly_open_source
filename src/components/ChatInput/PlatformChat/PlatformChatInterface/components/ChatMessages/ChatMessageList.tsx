import React, { createRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
  chats: any[];
  chatContainerRef: React.RefObject<HTMLDivElement>;
  messageRefs: React.MutableRefObject<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>;
  onCopyContent: (index: number) => void;
  chatTarget: string;
  applyingChanges: { [key: number]: boolean };
  onApplyChanges: (index: number) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = React.memo(({
	chats,
	chatContainerRef,
	messageRefs,
	onCopyContent,
	chatTarget,
	applyingChanges,
	onApplyChanges,
}) => {
	// Ensure refs are created for each message
	useEffect(() => {
		if (chats && chats.length > 0) {
			chats.forEach((_, index) => {
				if (!messageRefs.current[index]) {
					messageRefs.current[index] = createRef<HTMLDivElement>();
				}
			});
		}
	}, [chats, messageRefs]);

	return (
		<ScrollArea className="flex-grow px-1 sm:px-3 pb-4" ref={chatContainerRef}>
			<div className="pt-2">
				{chats.map((chat, index) => (
					<ChatMessage
						applyingChanges={applyingChanges}
						chatId={chat.id}
						chatTarget={chatTarget}
						index={index}
						key={index}
						message={chat.message}
						messageRef={messageRefs.current[index] || null}
						onApplyChanges={onApplyChanges}
						onCopy={onCopyContent}
						sender={chat.sender}
					/>
				))}
			</div>
		</ScrollArea>
	);
});

// Add PropTypes validation
ChatMessageList.propTypes = {
	chats: PropTypes.array.isRequired,
	chatContainerRef: PropTypes.any.isRequired,
	messageRefs: PropTypes.any.isRequired,
	onCopyContent: PropTypes.func.isRequired,
	chatTarget: PropTypes.string.isRequired,
	applyingChanges: PropTypes.any.isRequired,
	onApplyChanges: PropTypes.func.isRequired,
};

// Add display name for better debugging
ChatMessageList.displayName = "ChatMessageList";

export default ChatMessageList; 