import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePlatformChat } from "../usePlatformChat";
import { getTaskStatus } from "@/api/schedule_routes";
import { FileUploadStatus, PlatformChatInterfaceProps } from "./types";
import ChatMessageList from "./components/ChatMessages/ChatMessageList";
import ChatInputArea from "./components/InputArea/ChatInputArea";
import EmptyStateInput from "./components/InputArea/EmptyStateInput";
import FileUploadProgress from "./components/FileUpload/FileUploadProgress";
import BrainSelector from "./components/BrainSelector/BrainSelector";
import { usePathname } from "next/navigation";

export default function PlatformChatInterface({
	folderId,
	chatTarget,
	onContentUpdate,
	selectedModel,
	includeContext,
}: PlatformChatInterfaceProps): React.ReactNode {
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const pathname = usePathname();
	const [selectedContextFolder, setSelectedContextFolder] = useState<{id: string | null; name: string}>({
		id: folderId,
		name: "",
	});
	
	// Check if we're in the meetings context
	const isInMeetingsContext = pathname?.endsWith("/meetings") || false;

	const {
		chats,
		isPending,
		activeProject,
		handleChatSubmit,
		setChatInput,
		chatInput,
		session,
		isWaitingForResponse,
		googleSearch,
		setGoogleSearch,
	} = usePlatformChat(folderId, chatTarget, includeContext);

	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);
	const [applyingChanges, setApplyingChanges] = useState<{
    [key: number]: boolean;
  }>({});

	// Example prompts for empty state
	const examplePrompts: string[] = [];

	// State for brain selector
	const [showBrainSelector, setShowBrainSelector] = useState(false);

	// Function to set chat input with an example prompt
	const setExamplePrompt = (prompt: string) => {
		setChatInput(prompt);
	};

	const scrollToBottom = (): void => {
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

	// Function to poll for task status
	const pollTaskStatus = async(taskId: string, fileIndex: number): Promise<void> => {
		try {
			if (!session) return;
			const response = await getTaskStatus(session, taskId);

			if (response.status === "completed" && response.result) {
				// Update uploadingFiles status
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "success",
								result: response.result,
							}
							: item,
					),
				);

				toast({
					title: "File Processing Complete",
					description: `${uploadingFiles[fileIndex]?.file.name} has been processed successfully`,
					duration: 5000,
				});
			} else if (
				response.status === "pending" ||
        response.status === "processing"
			) {
				// Continue polling
				setTimeout(() => pollTaskStatus(taskId, fileIndex), 5000);
			} else {
				// Handle error
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: "Processing failed",
							}
							: item,
					),
				);

				toast({
					title: "File Processing Error",
					description: `Failed to process ${uploadingFiles[fileIndex]?.file.name}`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(`Error checking task status for ${taskId}:`, error);
			setUploadingFiles((prev) =>
				prev.map((item, index) =>
					index === fileIndex
						? {
							...item,
							status: "error",
							error: "Failed to check processing status",
						}
						: item,
				),
			);
		}
	};



	// Handle file removal
	const handleRemoveFile = (index: number) => {
		setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Function to handle applying changes
	const handleApplyChanges = (index: number) => {
		if (chats && chats.length > 0) {
			setApplyingChanges((prev) => ({ ...prev, [index]: true }));

			const lastChat = chats[chats.length - 1];
			if (typeof lastChat.message === "string") {
				onContentUpdate?.(lastChat.message);
			} else if (lastChat.sender !== "User" && lastChat.message.content) {
				const documentID = `:::document{#${folderId}}`;
				if (typeof lastChat.message.content === "string" && onContentUpdate) {
					onContentUpdate(lastChat.message.content.replace(documentID, "").replace(":::", ""));

					// Reset the state after a brief delay to show success
					setTimeout(() => {
						setApplyingChanges((prev) => ({ ...prev, [index]: false }));
					}, 1000);
				}
			}
		}
	};

	// Submit handler
	const handleSubmit = () => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project",
				variant: "destructive",
			});
			return;
		}

		// Only include successfully processed files
		const successfulFiles = uploadingFiles
			.filter((file) => file.status === "success" && file.result)
			.map((file) => file.result!);

		handleChatSubmit({
			message: chatInput,
			files: successfulFiles,
		});

		// Clear attachments after submission
		setUploadingFiles([]);
		setShowUploadProgress(false);
	};

	// Create a map of refs for message content elements
	const messageRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});

	// Create a more reliable function to extract text content
	const getTextFromHtml = (html: string): string => {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;
		return tempDiv.textContent || tempDiv.innerText || "";
	};

	// Function to copy formatted content
	const copyFormattedContent = (index: number): void => {
		const messageRef = messageRefs.current[index];

		if (messageRef && messageRef.current) {
			// Get the HTML content from the rendered message
			const htmlContent = messageRef.current.innerHTML;

			// Create a new clipboard item with both plain text and HTML formats
			const plainText = getTextFromHtml(htmlContent);

			// Use the newer Clipboard API if available
			if (navigator.clipboard && "write" in navigator.clipboard) {
				try {
					// @ts-expect-ignore - ClipboardItem might not be recognized by TypeScript
					const clipboardItem = new ClipboardItem({
						"text/plain": new Blob([plainText], { type: "text/plain" }),
						"text/html": new Blob([htmlContent], { type: "text/html" }),
					});

					// @ts-expect-ignore - Clipboard write method might not be recognized by TypeScript
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
							// @ts-expect-ignore - Clipboard writeText might not be recognized by TypeScript
							navigator.clipboard.writeText(plainText);
							toast({
								title: "Plain text copied to clipboard",
								description: "HTML formatting not supported in your browser",
								duration: 2000,
							});
						});
				} catch (err) {
					// If ClipboardItem is not supported, fallback to plain text
					// @ts-expect-ignore - Clipboard writeText might not be recognized by TypeScript
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
			if (typeof chats[index].message === "string") {
				navigator.clipboard.writeText(chats[index].message);
				toast({
					title: "Copied to clipboard",
					duration: 2000,
				});
			} else	 if (chats[index].message.content) {
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

	// Folder selector handler
	const handleFolderSelect = (newFolderId: string | null, folderName: string) => {
		setSelectedContextFolder({ id: newFolderId, name: folderName });
		setShowBrainSelector(false);
	};

	return (
		<div className="flex flex-col h-full">
			{chats && chats.length > 0 ? (
			// Regular chat view when there are messages
				<>
					<ChatMessageList
						applyingChanges={applyingChanges}
						chatContainerRef={chatContainerRef}
						chatTarget={chatTarget}
						chats={chats}
						messageRefs={messageRefs}
						onApplyChanges={handleApplyChanges}
						onCopyContent={copyFormattedContent}
					/>
					<div
						className={`sticky bottom-0 px-4 py-3 border-t border-slate-100 backdrop-blur-sm ${
							isInMeetingsContext ? "pb-4 bg-pink-100" : "bg-white"
						}`}
					>
						{activeProject && (
							<ChatInputArea
								chatInput={chatInput}
								fileInputRef={fileInputRef}
								googleSearch={googleSearch}
								includeContext={includeContext}
								isPending={isPending}
								isWaitingForResponse={isWaitingForResponse}
								onRemoveFile={handleRemoveFile}
								onSubmit={handleSubmit}
								selectedContextFolder={selectedContextFolder}
								selectedModel={selectedModel}
								setChatInput={setChatInput}
								setGoogleSearch={setGoogleSearch}
								setShowBrainSelector={setShowBrainSelector}
								showBrainSelector={showBrainSelector}
								uploadingFiles={uploadingFiles}
								isInMeetingsContext={isInMeetingsContext}
							/>
						)}
					</div>
				</>
			) : (
			// Empty state
				<div className="flex flex-col items-center justify-center h-full">
					<EmptyStateInput
						chatInput={chatInput}
						examplePrompts={examplePrompts}
						fileInputRef={fileInputRef}
						googleSearch={googleSearch}
						isPending={isPending}
						isWaitingForResponse={isWaitingForResponse}
						onRemoveFile={handleRemoveFile}
						onSubmit={handleSubmit}
						selectedContextFolder={selectedContextFolder}
						setChatInput={setChatInput}
						setExamplePrompt={setExamplePrompt}
						setGoogleSearch={setGoogleSearch}
						setShowBrainSelector={setShowBrainSelector}
						showBrainSelector={showBrainSelector}
						uploadingFiles={uploadingFiles}
					/>
				</div>
			)}
			{showUploadProgress && uploadingFiles.length > 0 && (
				<FileUploadProgress
					files={uploadingFiles}
					onClose={() => {
						const allProcessed = uploadingFiles.every(
							(file) => file.status === "success" || file.status === "error",
						);
						if (allProcessed) {
							setShowUploadProgress(false);
						}
					}}
				/>
			)}
			{showBrainSelector && (
				<BrainSelector
					onFolderSelect={handleFolderSelect}
					selectedFolderId={selectedContextFolder.id}
				/>
			)}
		</div>
	);
} 