import React, {
	useRef,
	useEffect,
	useLayoutEffect,
	createRef,
} from "react";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	CornerDownLeft,
	Loader2,
	Paperclip,
	Copy,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlatformChat } from "./usePlatformChat";
import { useToast } from "@/components/ui/use-toast";
import clsx from "clsx";
import AtSelectorComponent from "./components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import EmptyChatInterface from "./PlatformChatInterface/components/EmptyChatInterface/EmptyChatInterface";
// Define models for the UI
const models = [
	{ id: "gemini-2.5-pro", name: "Gemini high" },
	{ id: "gemini-2.5-flash", name: "Gemini Flash" },
	{ id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
	{ id: "gpt-4o", name: "GPT-4.0" },
];


export default function PlatformChatInterface({
	chatTarget,
	folderId,
	selectedModel,
	includeContext,
}: {
  folderId: string;
  chatTarget: string;
  onContentUpdate?: (newContent: string) => void;
  selectedModel: string;
  includeContext: boolean;
}) {
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();

	const {
		chats,
		isPending,
		activeProject,
		handleChatSubmit,
		setChatInput,
		chatInput,
		session,
		isWaitingForResponse,
		setIsWaitingForResponse,
	} = usePlatformChat(folderId, chatTarget, selectedModel, includeContext);
	const { setSidePanel, setCollapsed, contextFolder } = useChatStore();


	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			const scrollContainer = chatContainerRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	};

	useLayoutEffect(() => {
		scrollToBottom();
		const timer = setTimeout(scrollToBottom, 500);
		return () => clearTimeout(timer);
	}, [chats]);

	useEffect(() => {
		const timer = setTimeout(scrollToBottom, 100);
		const timer2 = setTimeout(scrollToBottom, 300);
		return () => {
			clearTimeout(timer);
			clearTimeout(timer2);
		};
	}, [chats]);



	// Update the button click handlers to use the new handleSubmit function
	const handleSubmit = () => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project",
				variant: "destructive",
			});
			return;
		}


		handleChatSubmit({
			message: chatInput,
			files: [],
		});
	};


	const loadDocumentPanel = () => (
		<>
			<div className="flex gap-2">
	
				<Button
					className={clsx(
						"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
						contextFolder.name && "text-indigo-500 bg-indigo-50/50",
					)}
					disabled={false}
					onClick={() => {
						setCollapsed(true);
						setSidePanel({
							isOpen: true,
							type: "folder",
							resourceId:  folderId,
						});
					}}
					size="sm"
					title={contextFolder.id ? `Using context: ${contextFolder.name}` : "Add context "}
					type="button"
					variant="ghost"
				>
					<Paperclip className="h-4 w-4" />
				</Button>		
			</div>
		</>
	);


	// Create a map of refs for message content elements
	const messageRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});

	// Ensure refs are created for each message
	useEffect(() => {
		if (chats && chats.length > 0) {
			chats.forEach((chat, index) => {
				if (!messageRefs.current[index]) {
					messageRefs.current[index] = createRef<HTMLDivElement>();
				}
			});
		}
	}, [chats]);

	// Create a more reliable function to extract text content
	const getTextFromHtml = (html: string): string => {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;
		return tempDiv.textContent || tempDiv.innerText || "";
	};

	// Function to copy formatted content
	const copyFormattedContent = (index: number) => {
		const messageRef = messageRefs.current[index];

		if (messageRef && messageRef.current) {
			// Get the HTML content from the rendered message
			const htmlContent = messageRef.current.innerHTML;

			// Create a new clipboard item with both plain text and HTML formats
			const plainText = getTextFromHtml(htmlContent);

			// Use the newer Clipboard API if available
			if (navigator.clipboard && "write" in navigator.clipboard) {
				try {
					// @ts-ignore - ClipboardItem might not be recognized by TypeScript
					const clipboardItem = new ClipboardItem({
						"text/plain": new Blob([plainText], { type: "text/plain" }),
						"text/html": new Blob([htmlContent], { type: "text/html" }),
					});

					// @ts-ignore - Clipboard write method might not be recognized by TypeScript
					navigator.clipboard
						.write([clipboardItem])
						.then(() => {
							toast({
								title: "Copied to clipboard!",
								duration: 2000,
							});
						})
						.catch((err) => {
							console.error("Failed to copy: ", err);
							// Fallback to plain text
							// @ts-ignore - Clipboard writeText might not be recognized by TypeScript
							navigator.clipboard.writeText(plainText);
							toast({
								title: "Plain text copied to clipboard",
								description: "HTML formatting not supported in your browser",
								duration: 2000,
							});
						});
				} catch (err) {
					// If ClipboardItem is not supported, fallback to plain text
					// @ts-ignore - Clipboard writeText might not be recognized by TypeScript
					navigator.clipboard.writeText(plainText);
					toast({
						title: "Copied to clipboard",
						description: "HTML formatting not supported in your browser",
						duration: 2000,
					});
				}
			} else {
				// Fallback for browsers that don't support the newer API
				// @ts-ignore - Clipboard writeText might not be recognized by TypeScript
				navigator.clipboard.writeText(plainText);
				toast({
					title: "Copied to clipboard",
					description: "HTML formatting not supported in your browser",
					duration: 2000,
				});
			}
		} else {
			// If ref doesn't exist, fall back to original behavior
			if (typeof chats[index].message !== "string" && chats[index].message.content) {
				const contentStr =
          typeof chats[index].message.content === "string"
          	? chats[index].message.content
          	: JSON.stringify(chats[index].message.content);

				navigator.clipboard.writeText(contentStr);
				toast({
					title: "Copied to clipboard",
					duration: 2000,
				});
			}
		}
	};

	// Update the regular chat input section
	const renderChatInput = () => (
		<div className="px-4 py-2 flex flex-col justify-end">
			<div className="relative overflow-hidden rounded-lg border border-black bg-background focus-within:ring-1 focus-within:ring-ring">
				<Label className="sr-only" htmlFor="message">
					Message
				</Label>
				{/* Display selected model and context settings */}
				<div className="absolute bottom-0 left-2 z-10">
					<div className="flex items-center gap-2 py-1">
						<span className="text-xs text-muted-foreground">
							Model:{" "}
							{models.find(
								(m: { id: string; name: string }) => m.id === selectedModel,
							)?.name || selectedModel} |
						</span>
						{contextFolder.name && (
							<span className="text-xs text-muted-foreground">
								New reports will be saved in {contextFolder.name} folder | 
							</span>
						)}
					</div>
				</div>
				<div className="absolute top-0 left-2 z-10">
					<AtSelectorComponent />
				</div>
				<Textarea
					className="min-h-10 resize-none border-0 p-3 pb-4 mt-4 shadow-none focus-visible:ring-0"
					disabled={isPending}
					id="message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (chatInput.trim() && !isPending) {
								handleSubmit();
							}
						}
					}}
					placeholder="Type your message here..."
					value={chatInput}
				/>
				<div className="flex items-center p-3 pt-0">
					{loadDocumentPanel()}
					<Button
						className="ml-auto gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						disabled={
							isWaitingForResponse ||
							(!chatInput.trim() )
						}
						onClick={handleSubmit}
						size="sm"
						type="submit"
					>
						{isWaitingForResponse ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							</>
						) : (
							<>
								Send
								<CornerDownLeft className="h-3.5 w-3.5" />
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col h-full max-w-4xl mx-auto">
			{chats && chats.length > 0 ? (
			// Regular chat view when there are messages
				<ScrollArea
					className="flex-grow px-1 sm:px-3 pb-4"
					ref={chatContainerRef}
				>
					<div className="pt-2">
						{chats.map((history, index) => (
							<div className="flex flex-col gap-2" key={index}>
								{  (typeof history.message === "string" ||  !["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(history.message.function_call?.name || "")) && (
									<div
										className={`${
											history.sender.toLowerCase() === "user"
												? "flex justify-end mb-4"
												: "block w-full"
										}`}
									>
										<div
											className={`${
												history.sender.toLowerCase() === "user"
													? "max-w-3xl bg-gray-50 border border-gray-100 rounded-xl p-2 shadow-sm mx-2"
													: "w-full bg-white py-3 px-2 border-b border-slate-100 last:border-b-0 min-h-[40px] transition-all duration-200"
											}`}
										>
											{history.sender.toLowerCase() !== "user" && (index === 0 || chats[index - 1].sender.toLowerCase() === "user") && (
												<div className="text-xs text-slate-400 mb-1 pl-1">
											Flowlly
												</div>
											)}
											<div
												ref={messageRefs.current[index] || null}
											>
												{history.message && (
													<AgentMessageInteractiveView id={history.id}
														message={history.message}
														setIsWaitingForResponse={setIsWaitingForResponse}
													/>
												)}
											</div>
											{/* Improve the copy button UI and add proper spacing */}

											{/* {history.sender.toLowerCase() !== "user" &&  (
												<div className="mt-1 flex justify-start items-center">
													<Button
														className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 p-1 h-auto rounded-md opacity-60 hover:opacity-100 transition-opacity"
														onClick={() => copyFormattedContent(index)}
														size="sm"
														variant="ghost"
													>
														<Copy className="w-3 h-3" />
														<span>Copy</span>
													</Button>
												</div>
											)} */}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</ScrollArea>
			) : (
				<div className="flex flex-col items-center justify-center h-full">
					<EmptyChatInterface
						chatInput={chatInput}
						handleSubmit={handleSubmit}
						isPending={isPending}
						isWaitingForResponse={isWaitingForResponse}
						loadDocumentPanel={loadDocumentPanel}
						setChatInput={setChatInput}
					/>
				</div>
			)}
			{/* Only show this input area when there are chats */}
			{chats && chats.length > 0 && (
				<div className="sticky bottom-0 px-4 py-3 bg-white border-t border-slate-100 backdrop-blur-sm">
					{activeProject && renderChatInput()}
				</div>
			)}
		</div>
	);
}
