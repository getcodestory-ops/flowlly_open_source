import React from "react";
import { Button } from "@/components/ui/button";
import { X, AtSign } from "lucide-react";

interface MentionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export default function MentionPopup({ isOpen, onClose, triggerRef }: MentionPopupProps) {
	if (!isOpen) return null;

	return (
		<div 
			className="fixed z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4" 
			data-mention-popup
			style={{
				bottom: triggerRef.current ? `${triggerRef.current.getBoundingClientRect().top + window.scrollY + 8}px` : "auto",
				left: triggerRef.current ? `${triggerRef.current.getBoundingClientRect().left}px` : "auto",
			}}
		>
			<div className="flex justify-between items-center mb-3">
				<span className="font-medium">Mention</span>
				<Button
					className="h-6 w-6 p-0"
					onClick={onClose}
					size="sm"
					variant="ghost"
				>
					<X size={16} />
				</Button>
			</div>
			<div className="border-b border-gray-200 pb-2 mb-2">
				<input
					className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300"
					placeholder="Search..."
					type="text"
				/>
			</div>
			<div className="max-h-60 overflow-y-auto">
				{/* File selector will be built in next step */}
				<div className="py-2 text-sm text-gray-500">
          File selector will be implemented in the next step
				</div>
			</div>
		</div>
	);
}

// Export a button component that can be used to trigger the popup
export function MentionButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			className="h-6 w-6 p-0 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
			onClick={onClick}
			size="sm"
			type="button"
			variant="ghost"
		>
			<AtSign className="h-3.5 w-3.5" />
		</Button>
	);
} 