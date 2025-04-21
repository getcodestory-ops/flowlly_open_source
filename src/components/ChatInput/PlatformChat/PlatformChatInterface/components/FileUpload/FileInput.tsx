import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, Search, Brain } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import clsx from "clsx";

interface FileInputProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
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
				accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
				className="hidden"
				disabled={isPending || isWaitingForResponse}
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
					disabled={isPending || isWaitingForResponse}
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
							disabled={isPending || isWaitingForResponse}
							size="sm"
							title={
								selectedContextFolder.id
									? `Using context: ${selectedContextFolder.name}`
									: "Select context folder"
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
					disabled={isPending || isWaitingForResponse}
					onClick={onFileClick}
					size="sm"
					title="Upload files"
					type="button"
					variant="ghost"
				>
					{isPending || isWaitingForResponse ? (
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