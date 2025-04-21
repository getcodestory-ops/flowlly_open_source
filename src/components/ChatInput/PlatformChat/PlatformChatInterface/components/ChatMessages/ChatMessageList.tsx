import React, { createRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";

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
  currentTaskId: string | null;
  session: any;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
	chats,
	chatContainerRef,
	messageRefs,
	onCopyContent,
	chatTarget,
	applyingChanges,
	onApplyChanges,
	currentTaskId,
	session,
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
				{currentTaskId && session && (
					<div className="block w-full mb-4">
						<div className="w-full bg-white py-3 px-2 border-b border-slate-100 min-h-[40px] transition-all duration-200">
							<div className="text-xs text-slate-400 mb-1 pl-1">
                Flowlly AI
							</div>
							<div className="text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
								<StreamComponent
									authToken={session.access_token}
									key={currentTaskId}
									onStreamComplete={() => {}}
									streamingKey={currentTaskId}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</ScrollArea>
	);
};

export default ChatMessageList; 