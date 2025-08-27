import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, Search, Brain } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import clsx from "clsx";

interface FileInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isPending: boolean;
  isWaitingForResponse: boolean;
  onFileClick: () => void;
  googleSearch: boolean;
  setGoogleSearch: (value: boolean) => void;
  showBrainSelector: boolean;
  setShowBrainSelector: (value: boolean) => void;
  selectedContextFolder: { id: string | null; name: string };
}

export const FileInput: React.FC<FileInputProps> = ({
	fileInputRef,
	isPending,
	isWaitingForResponse,
	onFileClick,
	googleSearch,
	setGoogleSearch,
	showBrainSelector,
	setShowBrainSelector,
	selectedContextFolder,
}) => {
	return (
		<>
			<input
				accept="text/plain,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3,.json,.xml,.jsonl,.jsonl.gz,.jsonl.bz2,.jsonl.zip,.jsonl.tar,.jsonl.tar.gz,.jsonl.tar.bz2,.jsonl.tar.zip,.jsonl.tar.tar.gz,.jsonl.tar.tar.bz2,.jsonl.tar.tar.zip"
				className="hidden"
				disabled={isPending}
				multiple
				ref={fileInputRef}
				type="file"
			/>
			<div className="flex gap-2">
				<Button
					className={clsx(
						"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
						googleSearch && "text-indigo-500 bg-indigo-50/50",
					)}
					disabled={false}
					onClick={() => setGoogleSearch(!googleSearch)}
					size="sm"
					type="button"
					variant="ghost"
				>
					<Search className="h-4 w-4" />
				</Button>
				<Dialog onOpenChange={setShowBrainSelector} open={showBrainSelector}>
					<DialogTrigger asChild>
						<Button
							className={clsx(
								"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
								selectedContextFolder.id && "text-indigo-500 bg-indigo-50/50",
							)}
							disabled={false}
							size="sm"
							title={
								selectedContextFolder.id
									? `Using context: ${selectedContextFolder.name}`
									: "Add contexts for the agent"
							}
							type="button"
							variant="ghost"
						>
							<Brain className="h-4 w-4" />
						</Button>
					</DialogTrigger>
				</Dialog>
				<Button
					className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2"
					disabled={isPending}
					onClick={onFileClick}
					size="sm"
					title="Upload files"
					type="button"
					variant="ghost"
				>
					{isPending ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Paperclip className="h-5 w-5" />
					)}
				</Button>
			</div>
		</>
	);
};

export default FileInput; 