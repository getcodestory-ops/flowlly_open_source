import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";
import FileInput from "../FileUpload/FileInput";
import FileDisplay from "../FileUpload/FileDisplay";
import Image from "next/image";
import { FileUploadStatus } from "../../types";

interface EmptyStateInputProps {
  chatInput: string;
  setChatInput: (text: string) => void;
  isPending: boolean;
  isWaitingForResponse: boolean;
  onSubmit: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  examplePrompts: string[];
  setExamplePrompt: (prompt: string) => void;
  uploadingFiles: FileUploadStatus[];
  onRemoveFile: (index: number) => void;
  googleSearch: boolean;
  setGoogleSearch: (value: boolean) => void;
  showBrainSelector: boolean;
  setShowBrainSelector: (value: boolean) => void;
  selectedContextFolder: { id: string | null; name: string };
}

export const EmptyStateInput: React.FC<EmptyStateInputProps> = ({
	chatInput,
	setChatInput,
	isPending,
	isWaitingForResponse,
	onSubmit,
	fileInputRef,
	examplePrompts,
	setExamplePrompt,
	uploadingFiles,
	onRemoveFile,
	googleSearch,
	setGoogleSearch,
	showBrainSelector,
	setShowBrainSelector,
	selectedContextFolder,
}) => {
	return (
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
				<Textarea
					className="min-h-20 resize-none border-0 p-4 shadow-none focus-visible:ring-0 text-slate-800"
					disabled={isPending}
					id="empty-message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (!isPending) {
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
              (!chatInput.trim() )
						}
						onClick={onSubmit}
						size="sm"
						type="submit"
					>
						{isPending ? (
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

export default EmptyStateInput; 