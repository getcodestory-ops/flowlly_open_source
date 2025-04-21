import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2 } from "lucide-react";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";

interface ChatMessageProps {
  message: any;
  sender: string;
  index: number;
  onCopy: (index: number) => void;
  chatTarget: string;
  applyingChanges: { [key: number]: boolean };
  onApplyChanges: (index: number) => void;
  messageRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
	message,
	sender,
	index,
	onCopy,
	chatTarget,
	applyingChanges,
	onApplyChanges,
	messageRef,
}) => {
	const isUserMessage = sender.toLowerCase() === "user";

	return (
		<div
			className={`${
				isUserMessage
					? "flex justify-end mb-4"
					: "block w-full"
			}`}
		>
			<div
				className={`${
					isUserMessage
						? "max-w-3xl bg-gray-50 border border-gray-100 rounded-xl p-2 shadow-sm mx-2"
						: "w-full bg-white py-3 px-2 border-b border-slate-100 last:border-b-0 min-h-[40px] transition-all duration-200"
				}`}
			>
				{!isUserMessage && (
					<div className="text-xs text-slate-400 mb-1 pl-1">
            Flowlly AI
					</div>
				)}
				<div ref={messageRef}>
					{message && <AgentMessageInteractiveView message={message} />}
				</div>
				{!isUserMessage && (
					<div className="mt-1 flex justify-between items-center">
						<Button
							className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 p-1 h-auto rounded-md opacity-60 hover:opacity-100 transition-opacity"
							onClick={() => onCopy(index)}
							size="sm"
							variant="ghost"
						>
							<Copy className="w-3 h-3" />
							<span>Copy</span>
						</Button>
						{chatTarget === "editor" && (
							<Button
								className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
								disabled={applyingChanges[index]}
								onClick={() => onApplyChanges(index)}
								size="sm"
								variant="secondary"
							>
								{applyingChanges[index] ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
									</>
								) : (
									<>
										<Check className="mr-2 h-4 w-4" />
                    Apply Changes
									</>
								)}
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessage; 