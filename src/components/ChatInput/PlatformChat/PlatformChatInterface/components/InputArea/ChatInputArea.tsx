import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";
import FileInput from "../FileUpload/FileInput";
import FileDisplay from "../FileUpload/FileDisplay";
import { FileUploadStatus, MODELS } from "../../types";

interface ChatInputAreaProps {
  chatInput: string;
  setChatInput: (text: string) => void;
  isPending: boolean;
  isWaitingForResponse: boolean;
  onSubmit: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedModel: string;
  includeContext: boolean;
  googleSearch: boolean;
  setGoogleSearch: (value: boolean) => void;
  showBrainSelector: boolean;
  setShowBrainSelector: (value: boolean) => void;
  uploadingFiles: FileUploadStatus[];
  onRemoveFile: (index: number) => void;
  selectedContextFolder: { id: string | null; name: string };
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
	chatInput,
	setChatInput,
	isPending,
	isWaitingForResponse,
	onSubmit,
	fileInputRef,
	selectedModel,
	includeContext,
	googleSearch,
	setGoogleSearch,
	showBrainSelector,
	setShowBrainSelector,
	uploadingFiles,
	onRemoveFile,
	selectedContextFolder,
}) => {
	return (
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
							{MODELS.find(
								(m) => m.id === selectedModel,
							)?.name || selectedModel}
						</span>
						{includeContext && (
							<span className="text-xs text-muted-foreground">
                Using context from project files
							</span>
						)}
						{googleSearch && (
							<span className="text-xs text-muted-foreground">
                Google search enabled (Disable google search to use flowlly tools)
							</span>
						)}
					</div>
				</div>
				<Textarea
					className="min-h-12 resize-none border-0 p-3 pb-8 shadow-none focus-visible:ring-0"
					disabled={isWaitingForResponse}
					id="message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (chatInput.trim() && !isWaitingForResponse) {
								onSubmit();
							}
						}
					}}
					placeholder="Type your message here..."
					value={chatInput}
				/>
				<FileDisplay 
					onRemoveFile={onRemoveFile} 
					uploadingFiles={uploadingFiles} 
				/>
				<div className="flex items-center p-3 pt-0">
					<FileInput
						fileInputRef={fileInputRef}
						googleSearch={googleSearch}
						isPending={isPending}
						isWaitingForResponse={isWaitingForResponse}
						onFileClick={() => fileInputRef.current?.click()}
						selectedContextFolder={selectedContextFolder}
						setGoogleSearch={setGoogleSearch}
						setShowBrainSelector={setShowBrainSelector}
						showBrainSelector={showBrainSelector}
					/>
					<Button
						className="ml-auto gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						disabled={
							isWaitingForResponse ||
              (!chatInput.trim() && uploadingFiles.length === 0)
						}
						onClick={onSubmit}
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
};

export default ChatInputArea; 