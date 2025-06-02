/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import React, {
	useRef,
	useEffect,
	useLayoutEffect,
	useState,
	createRef,
} from "react";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	CornerDownLeft,
	Check,
	Loader2,
	Paperclip,
	X,
	File,
	Copy,
	Search,
	Folder,
} from "lucide-react";
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlatformChat } from "./usePlatformChat";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileInFolder } from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { ProcessedFile } from "@/api/agentRoutes";
import Image from "next/image";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import clsx from "clsx";
import AtSelectorComponent from "./components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import { useQueryClient } from "@tanstack/react-query";
// Define models for the UI
const models = [
	{ id: "gemini-2.5-pro-preview-03-25", name: "Gemini Pro 2.5 (latest)" },
	{ id: "gemini-2.0-flash", name: "Gemini Flash" },
	{ id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
	{ id: "gpt-4o", name: "GPT-4.0" },
];

// Types for file upload handling
type FileUploadResponse = {
  task_id?: string;
  status?: string;
  error?: string;
  [key: string]: any;
};

type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string;
  result?: ProcessedFile;
};

export default function PlatformChatInterface({
	chatTarget,
	folderId,
	onContentUpdate,
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
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const {
		chats,
		isPending,
		activeProject,
		isOpen,
		onClose,
		handleChatSubmit,
		setChatInput,
		chatInput,
		onOpen,
		session,
		currentTaskId,
		isWaitingForResponse,
		googleSearch,
		setGoogleSearch,
		setCurrentTaskId,
		setIsWaitingForResponse,
	} = usePlatformChat(folderId, chatTarget, selectedModel, includeContext);
	const { setSidePanel, setCollapsed, contextFolder } = useChatStore();

	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);
	const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
	const queryClient = useQueryClient();
	// Ref to store the index of the last message we processed
	const lastChatIndexRef = useRef<number>(-1);

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

	// Function to poll for task status
	const pollTaskStatus = async(taskId: string, fileIndex: number, pollCount = 0) => {
		const MAX_POLL_ATTEMPTS = 60; // 5 minutes at 5-second intervals
		
		try {
			// Prevent infinite polling
			if (pollCount >= MAX_POLL_ATTEMPTS) {
				console.warn(`File polling timeout for task ${taskId} after ${MAX_POLL_ATTEMPTS} attempts`);
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: "Processing timeout",
							}
							: item,
					),
				);
				toast({
					title: "File Processing Timeout",
					description: `${uploadingFiles[fileIndex]?.file.name} processing timed out`,
					variant: "destructive",
				});
				return;
			}

			if (!session) return;
			const response = await getTaskStatus(session, taskId);

			// Validate response structure
			if (!response || typeof response.status !== "string") {
				console.error("Invalid response structure from getTaskStatus:", response);
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: "Invalid server response",
							}
							: item,
					),
				);
				return;
			}

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

				// Add to processed files
				setProcessedFiles((prev) => [...prev, response.result]);

				toast({
					title: "File Processing Complete",
					description: `${uploadingFiles[fileIndex]?.file.name} has been processed successfully`,
					duration: 5000,
				});
			} else if (
				response.status === "pending" ||
        response.status === "processing"
			) {
				// Continue polling with incremented count
				setTimeout(() => pollTaskStatus(taskId, fileIndex, pollCount + 1), 5000);
			} else if (response.status === "failed" || response.status === "error") {
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
			} else {
				// Handle unknown status
				console.warn(`Unknown file processing status: ${response.status}`);
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: `Unknown status: ${response.status}`,
							}
							: item,
					),
				);
			}
		} catch (error) {
			console.error(`Error checking task status for ${taskId}:`, error);
			
			// Don't immediately fail on network errors, but limit retries
			if (pollCount < 3) {
				setTimeout(() => pollTaskStatus(taskId, fileIndex, pollCount + 1), 10000); // Longer delay on errors
			} else {
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
				toast({
					title: "File Processing Error",
					description: `Network error while checking ${uploadingFiles[fileIndex]?.file.name} status`,
					variant: "destructive",
				});
			}
		}
	};

	// Handle file selection
	const handleFileSelect = async(e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !session || !activeProject) return;

		const selectedFiles = Array.from(e.target.files);
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

		// Check file sizes
		const oversizedFiles = selectedFiles.filter(
			(file) => file.size > MAX_FILE_SIZE,
		);
		if (oversizedFiles.length > 0) {
			toast({
				title: "File too large",
				description: `Some files exceed the 10MB limit: ${oversizedFiles
					.map((f) => f.name)
					.join(", ")}`,
				variant: "destructive",
			});
			return;
		}

		// Initialize upload status for each file
		const fileStatuses: FileUploadStatus[] = selectedFiles.map((file) => ({
			file,
			status: "pending",
			progress: 0,
		}));

		setUploadingFiles((prev) => [...prev, ...fileStatuses]);
		setShowUploadProgress(true);

		// Upload each file
		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			const currentIndex = uploadingFiles.length + i;

			// Update status to uploading
			setUploadingFiles((prev) =>
				prev.map((item, index) =>
					index === currentIndex ? { ...item, status: "uploading" } : item,
				),
			);

			try {
				const response = (await uploadFileInFolder(
					session,
					activeProject.project_id,
					file,
					contextFolder.id ?? folderId,
					undefined,
					(progress) => {
						setUploadingFiles((prev) =>
							prev.map((item, index) =>
								index === currentIndex ? { ...item, progress } : item,
							),
						);
					},
				)) as FileUploadResponse;

				if (response && response.task_id) {
					// Update status to processing
					setUploadingFiles((prev) =>
						prev.map((item, index) =>
							index === currentIndex
								? {
									...item,
									status: "processing",
									progress: 100,
									taskId: response.task_id,
								}
								: item,
						),
					);

					// Start polling for task status
					pollTaskStatus(response.task_id, currentIndex);
				}
			} catch (error) {
				console.error(`Error uploading file ${file.name}:`, error);
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === currentIndex
							? {
								...item,
								status: "error",
								error:
                    error instanceof Error ? error.message : "Upload failed",
							}
							: item,
					),
				);

				toast({
					title: "File Upload Error",
					description: `Failed to upload ${file.name}`,
					variant: "destructive",
				});
			}
		}

		// Reset the input value
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Handle file removal
	const handleRemoveFile = (index: number) => {
		const file = uploadingFiles[index];
		if (file.status === "success" && file.result) {
			setProcessedFiles((prev) =>
				prev.filter((pf) => pf.resource_id !== file.result?.resource_id),
			);
		}
		setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// Remove the automatic content update useEffect and add a function to handle applying changes
	const handleApplyChanges = (index: number) => {
		if (chats && chats.length > 0) {
			setApplyingChanges((prev) => ({ ...prev, [index]: true }));
			
			const lastChat = chats[chats.length - 1];
			if (lastChat.sender !== "User" && lastChat.message) {
				const documentID = `:::document{#${folderId}}`;
				if (typeof lastChat.message === "string" && onContentUpdate) {
					onContentUpdate(lastChat.message.replace(documentID, "").replace(":::", ""));
					setTimeout(() => {
						setApplyingChanges((prev) => ({ ...prev, [index]: false }));
					}, 1000);
				}
			}
		}
	};

	// Add FileUploadProgress component
	const FileUploadProgress = ({
		files,
		onClose,
	}: {
    files: FileUploadStatus[];
    onClose: () => void;
  }) => {
		const allCompleted = files.every(
			(file) => file.status === "success" || file.status === "error",
		);

		const successCount = files.filter(
			(file) => file.status === "success",
		).length;
		const errorCount = files.filter((file) => file.status === "error").length;
		const pendingCount = files.filter(
			(file) => file.status === "pending" || file.status === "uploading",
		).length;
		const processingCount = files.filter(
			(file) => file.status === "processing",
		).length;

		// Calculate overall progress
		const totalProgress =
      files.reduce((acc, file) => acc + file.progress, 0) / files.length;

		return (
			<div className="fixed bottom-4 left-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
				<div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<File className="text-blue-500" size={16} />
						<span className="font-medium">File Upload</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-500">
							{successCount}/{files.length} completed
						</span>
						<Button
							className="h-6 w-6 p-0"
							disabled={!allCompleted}
							onClick={onClose}
							size="sm"
							variant="ghost"
						>
							<X size={16} />
						</Button>
					</div>
				</div>
				<div className="w-full bg-gray-100 h-1">
					<div
						className="h-1 bg-blue-500 transition-all duration-300 ease-in-out"
						style={{ width: `${totalProgress}%` }}
					/>
				</div>
				<div className="max-h-60 overflow-y-auto p-2">
					{files.map((file, index) => (
						<div
							className="py-2 px-1 border-b border-gray-100 last:border-0"
							key={index}
						>
							<div className="flex justify-between items-center mb-1">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 flex-shrink-0">
										{file.status === "uploading" && (
											<Loader2
												className="animate-spin text-blue-500"
												size={16}
											/>
										)}
										{file.status === "processing" && (
											<Loader2
												className="animate-spin text-amber-500"
												size={16}
											/>
										)}
										{file.status === "success" && (
											<Check className="text-green-500" size={16} />
										)}
										{file.status === "error" && (
											<X className="text-red-500" size={16} />
										)}
										{file.status === "pending" && (
											<div className="w-2 h-2 bg-gray-300 rounded-full" />
										)}
									</div>
									<span
										className="text-sm truncate max-w-[180px]"
										title={file.file.name}
									>
										{file.file.name}
									</span>
								</div>
								<span className="text-xs text-gray-500">
									{file.status === "success"
										? "100%"
										: file.status === "error"
											? "Failed"
											: file.status === "processing"
												? "Processing"
												: file.status === "uploading"
													? `${file.progress}%`
													: "Pending"}
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-1.5">
								<div
									className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
										file.status === "success"
											? "bg-green-500"
											: file.status === "error"
												? "bg-red-500"
												: file.status === "processing"
													? "bg-amber-500"
													: "bg-blue-500"
									}`}
									style={{ width: `${file.progress}%` }}
								/>
							</div>
							{file.status === "processing" && (
								<div className="mt-1 text-xs text-amber-600">
                  Document processing in progress...
								</div>
							)}
							{file.status === "error" && file.error && (
								<div className="mt-1 text-xs text-red-600">{file.error}</div>
							)}
						</div>
					))}
				</div>
				<div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
					<div className="flex items-center gap-2 text-sm">
						{successCount > 0 && (
							<span className="text-green-500">{successCount} successful</span>
						)}
						{errorCount > 0 && (
							<span className="text-red-500">{errorCount} failed</span>
						)}
						{pendingCount > 0 && (
							<span className="text-blue-500">{pendingCount} pending</span>
						)}
						{processingCount > 0 && (
							<span className="text-amber-500">
								{processingCount} processing
							</span>
						)}
					</div>
					<Button
						disabled={!allCompleted}
						onClick={onClose}
						size="sm"
						variant={allCompleted ? "outline" : "default"}
					>
						{allCompleted
							? "Close"
							: processingCount > 0
								? "Processing..."
								: "Uploading..."}
					</Button>
				</div>
			</div>
		);
	};

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
		setProcessedFiles([]);
		setShowUploadProgress(false);
	};

	// Update the file input section in both empty state and regular chat view
	const renderFileInput = () => (
		<>
			<input
				accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3"
				className="hidden"
				disabled={isPending}
				multiple
				onChange={handleFileSelect}
				ref={fileInputRef}
				type="file"
			/>
			<div className="flex gap-2">
				{/* <Button
					className={clsx(
						"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
						googleSearch && "text-indigo-500 bg-indigo-50/50",
					)}
					disabled={isPending || isWaitingForResponse}
					onClick={() => setGoogleSearch(!googleSearch)}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Search className="h-4 w-4" />
				</Button> */}
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
				{/* <Button
					className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2"
					disabled={isPending || isWaitingForResponse}
					onClick={() => fileInputRef.current?.click()}
					size="sm"
					title="Upload files"
					type="button"
					variant="ghost"
				>
					{isPending || isWaitingForResponse ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Paperclip className="h-4 w-4" />
					)}
				</Button> */}
			</div>
		</>
	);

	// Update the file display section
	const renderFileDisplay = () => {
		const successfulFiles = uploadingFiles.filter(
			(file) => file.status === "success",
		);

		if (successfulFiles.length === 0) return null;

		return (
			<div className="px-4 pb-3">
				<div className="flex flex-wrap gap-2 mt-2">
					{successfulFiles.map((file, index) => (
						<Badge
							className="py-1.5 px-3 bg-indigo-50/70 text-indigo-600 hover:bg-indigo-50 border border-indigo-100/50 rounded-lg"
							key={index}
							variant="secondary"
						>
							<File className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
							<span className="truncate max-w-[150px]">{file.file.name}</span>
							<Button
								className="h-5 w-5 p-0 ml-1.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700"
								onClick={() => handleRemoveFile(index)}
								size="sm"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					))}
				</div>
			</div>
		);
	};

	// Update the empty state textarea section
	const renderEmptyStateInput = () => (
		<div className="flex flex-col items-center px-4 py-6">
			<div className="max-w-md w-full bg-white rounded-xl p-6 mb-6 shadow-sm">
				<div className="text-center mb-6">
					<Image 
						alt="Flowlly AI" 
						className="mx-auto mb-3" 
						height={96} 
						src="/logos/FlowllyGuy.png" 
						width={96}
					/>
					<h3 className="text-lg font-medium text-indigo-900 mb-2">
						Chat with Flowlly
					</h3>
					<p className="text-slate-500 text-sm mb-4">
						🚀 Hey there! I&apos;m your AI assistant, ready to help with your 
						project tasks, docs, and workflows. Lets build something awesome together! ✨
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
					{examplePrompts.length > 0 && examplePrompts.map((prompt, index) => (
						<Button
							className="justify-start text-left bg-white border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors text-sm"
							key={index}
							onClick={() => setExamplePrompt(prompt)}
							size="sm"
							variant="outline"
						>
							<span className="truncate">{prompt}</span>
						</Button>
					))}
				</div>
			</div>
			<div className="w-full relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm focus-within:ring-1 focus-within:ring-indigo-300 transition-shadow">
				<Label className="sr-only" htmlFor="empty-message">
					Message
				</Label>
				<div className="absolute top-0 left-2 z-10 pt-2">
					<AtSelectorComponent />
				</div>
				<Textarea
					className="min-h-20 resize-none border-0 p-4 pl-12 mt-4 shadow-none focus-visible:ring-0 text-slate-800"
					disabled={isPending}
					id="empty-message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit();
						}
					}}
					placeholder="Type your message here..."
					value={chatInput}
				/>
				{renderFileDisplay()}
				<div className="flex items-center p-3 pt-0">
					{renderFileInput()}
					<Button
						className="ml-auto gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						disabled={
							isPending ||
							(!chatInput.trim() && uploadingFiles.length === 0)
						}
						onClick={handleSubmit}
						size="sm"
						type="submit"
					>
						{isPending ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Sending...
							</>
						) : isWaitingForResponse ? (
							<>
								Send Next
								<CornerDownLeft className="h-3.5 w-3.5" />
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
						{googleSearch && (
							<span className="text-xs text-muted-foreground">
								Google search enabled (Disable google search to use flowlly tools)
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
				{renderFileDisplay()}
				<div className="flex items-center p-3 pt-0">
					{renderFileInput()}
					<Button
						className="ml-auto gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						disabled={
							isPending ||
							(!chatInput.trim() && uploadingFiles.length === 0)
						}
						onClick={handleSubmit}
						size="sm"
						type="submit"
					>
						{isPending ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Sending...
							</>
						) : isWaitingForResponse ? (
							<>
								Send Next
								<CornerDownLeft className="h-3.5 w-3.5" />
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
								{  (typeof history.message === "string" || (history.message.function_call?.name !== "run_workflow" && history.message.function_call?.name !== "send_data_to_workflow")) && (
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
											{history.sender.toLowerCase() !== "user" && (
												<div className="text-xs text-slate-400 mb-1 pl-1">
											Flowlly AI
												</div>
											)}
											<div
												ref={messageRefs.current[index] || null}
											>
												{history.message && (
													<AgentMessageInteractiveView id={history.id} message={history.message} />
												)}
											</div>
											{/* Improve the copy button UI and add proper spacing */}

											{history.sender.toLowerCase() !== "user" &&  (
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
											)}
										</div>
									</div>
								)}
							</div>
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
											onStreamComplete={(content) => {
												
											}}
											streamingKey={currentTaskId}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			) : (
			// Empty state
				<div className="flex flex-col items-center justify-center h-full">
					{renderEmptyStateInput()}
				</div>
			)}
			{/* Only show this input area when there are chats */}
			{chats && chats.length > 0 && (
				<div className="sticky bottom-0 px-4 py-3 bg-white border-t border-slate-100 backdrop-blur-sm">
					{activeProject && renderChatInput()}
				</div>
			)}
			{/* File upload progress UI */}
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
		</div>
	);
}
