import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAIDocumentLineEdit } from "@/api/documentRoutes";
import { useStore } from "@/utils/store";

interface BubbleMenuProps {
  editor: Editor;
  onCreateComment: (commentText: string) => void;
}

const EditorBubbleMenu: React.FC<BubbleMenuProps> = ({ editor, onCreateComment }) => {
	const { session } = useStore();
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [showCommentInput, setShowCommentInput] = useState(false);
	const [showRevisionInput, setShowRevisionInput] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [userComments, setUserComments] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hasSelection, setHasSelection] = useState(false);
	const [isHoveringSelection, setIsHoveringSelection] = useState(false);
	const [isHoveringBubble, setIsHoveringBubble] = useState(false);
	const bubbleRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const commentsTextareaRef = useRef<HTMLTextAreaElement>(null);
	const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Update visibility based on hover states with delay
	useEffect(() => {
		const shouldShow = hasSelection && (isHoveringSelection || isHoveringBubble || showCommentInput || showRevisionInput);
		
		if (shouldShow) {
			// Clear any existing timeout and show immediately
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
				selectionTimeoutRef.current = null;
			}
			setIsVisible(true);
		} else {
			// Add a small delay before hiding to allow mouse movement to bubble
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
			}
			selectionTimeoutRef.current = setTimeout(() => {
				setIsVisible(false);
			}, 150); // 150ms delay
		}
	}, [hasSelection, isHoveringSelection, isHoveringBubble, showCommentInput, showRevisionInput]);

	useEffect(() => {
		if (!editor) return;

		const updateBubbleMenu = () => {
			const { selection } = editor.state;
			const { from, to } = selection;

			// Check if there's a text selection
			if (from !== to) {
				const { view } = editor;
				const start = view.coordsAtPos(from);
				const end = view.coordsAtPos(to);

				const selectionBounds = {
					left: Math.min(start.left, end.left),
					right: Math.max(start.right, end.right),
					top: Math.min(start.top, end.top),
					bottom: Math.max(start.bottom, end.bottom),
				};

				setPosition({
					top: selectionBounds.top - 45, // Position close above selection
					left: selectionBounds.left + (selectionBounds.right - selectionBounds.left) / 2 - 100, // Center horizontally
				});
				setHasSelection(true);
			} else {
				setHasSelection(false);
				setIsHoveringSelection(false);
				setShowCommentInput(false);
				setShowRevisionInput(false);
				setCommentText("");
				setUserComments("");
			}
		};

		// Add mouse event listeners to editor
		const handleMouseMove = (event: MouseEvent) => {
			if (!hasSelection) return;

			const { selection } = editor.state;
			const { from, to } = selection;

			if (from === to) return;

			// Check if mouse is over selected text
			const { view } = editor;
			const domRange = view.domAtPos(from);
			const range = document.createRange();
			
			try {
				range.setStart(domRange.node, domRange.offset);
				const endDom = view.domAtPos(to);
				range.setEnd(endDom.node, endDom.offset);
				
				const rects = range.getClientRects();
				let isOverSelection = false;
				
				for (let i = 0; i < rects.length; i++) {
					const rect = rects[i];
					if (
						event.clientX >= rect.left &&
						event.clientX <= rect.right &&
						event.clientY >= rect.top &&
						event.clientY <= rect.bottom
					) {
						isOverSelection = true;
						break;
					}
				}
				
				setIsHoveringSelection(isOverSelection);
			} catch (error) {
				// Fallback: assume not hovering if there's an error
				setIsHoveringSelection(false);
			}
		};

		const editorElement = editor.view.dom;
		editorElement.addEventListener("mousemove", handleMouseMove);
		
		editor.on("selectionUpdate", updateBubbleMenu);
		editor.on("transaction", updateBubbleMenu);

		return () => {
			editorElement.removeEventListener("mousemove", handleMouseMove);
			editor.off("selectionUpdate", updateBubbleMenu);
			editor.off("transaction", updateBubbleMenu);
			// Clean up timeout on unmount
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
			}
		};
	}, [editor, hasSelection]);

	// Focus textarea when comment input is shown
	useEffect(() => {
		if (showCommentInput && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [showCommentInput]);

	// Focus textarea when revision input is shown
	useEffect(() => {
		if (showRevisionInput && commentsTextareaRef.current) {
			commentsTextareaRef.current.focus();
		}
	}, [showRevisionInput]);

	// Handle bubble menu hover
	const handleBubbleMouseEnter = () => {
		setIsHoveringBubble(true);
	};

	const handleBubbleMouseLeave = () => {
		setIsHoveringBubble(false);
	};

	const handleCommentClick = () => {
		setShowCommentInput(true);
		setShowRevisionInput(false);
	};

	const handleRevisionClick = () => {
		setShowRevisionInput(true);
		setShowCommentInput(false);
		setUserComments("");
	};

	const handleSubmitComment = () => {
		if (commentText.trim()) {
			onCreateComment(commentText.trim());
			setCommentText("");
			setShowCommentInput(false);
			// Clear the selection to hide the bubble menu after comment submission
			editor.commands.setTextSelection(editor.state.selection.to);
		}
	};

	const handleCancelComment = () => {
		setCommentText("");
		setShowCommentInput(false);
		// Clear the selection to hide the bubble menu after canceling
		editor.commands.setTextSelection(editor.state.selection.to);
	};

	const handleSubmitRevision = async() => {
		if (!userComments.trim() || !session) return;

		setIsLoading(true);
		try {
			// Get the selected text
			const { selection } = editor.state;
			const selectedText = editor.state.doc.textBetween(selection.from, selection.to);

			const response = await getAIDocumentLineEdit(
				session,
				selectedText,
				userComments.trim(),
			);

			if (response.success && response.data.updated_content) {
				// Generate a unique diff group ID for this change
				const diffGroupId = `diff-${Date.now()}-${Math.random().toString(36)
					.substring(2, 11)}`;

				// Apply deletion class to the original content
				editor.chain()
					.focus()
					.setTextSelection({ from: selection.from, to: selection.to })
					.setHighlight({ color: "#f98181" })
					.updateAttributes("highlight", { 
						class: "delete",
						"data-diff-group": diffGroupId,
					})
					.run();

				// Insert the new content after the original content
				editor.chain()
					.focus()
					.setTextSelection(selection.to)
					.insertContent(response.data.updated_content)
					.run();

				// Apply insertion class to the newly inserted content
				const insertionStart = selection.to;
				const insertionEnd = insertionStart + response.data.updated_content.length;
				
				editor.chain()
					.focus()
					.setTextSelection({ from: insertionStart, to: insertionEnd })
					.setHighlight({ color: "#8ce99a" })
					.updateAttributes("highlight", { 
						class: "insert",
						"data-diff-group": diffGroupId,
					})
					.run();
				
				setUserComments("");
				setShowRevisionInput(false);
				// Clear the selection to hide the bubble menu after revision submission
				editor.commands.setTextSelection(insertionEnd);
			}
		} catch (error) {
			console.error("Error getting AI revision:", error);
			// Show error message or fallback behavior
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelRevision = () => {
		setUserComments("");
		setShowRevisionInput(false);
		// Clear the selection to hide the bubble menu after canceling
		editor.commands.setTextSelection(editor.state.selection.to);
	};

	if (!editor || !isVisible) {
		return null;
	}

	return (
		<div
			className="flex flex-col gap-1 p-1 bg-white border border-gray-300 rounded-md shadow-lg z-50"
			onMouseEnter={handleBubbleMouseEnter}
			onMouseLeave={handleBubbleMouseLeave}
			ref={bubbleRef}
			style={{
				position: "fixed",
				top: `${position.top}px`,
				left: `${position.left}px`,
				zIndex: 9999,
				minWidth: (showCommentInput || showRevisionInput) ? "280px" : "auto",
			}}
		>
			{!showCommentInput && !showRevisionInput ? (
				<div className="flex items-center gap-1">
					{/* Format buttons */}
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("bold") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleBold()
							.run()}
						title="Bold"
						type="button"
					>
						<strong>B</strong>
					</button>
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("italic") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleItalic()
							.run()}
						title="Italic"
						type="button"
					>
						<em>I</em>
					</button>
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("underline") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleUnderline()
							.run()}
						title="Underline"
						type="button"
					>
						<u>U</u>
					</button>
					<button
						className={`p-1.5 rounded text-xs hover:bg-yellow-100 ${
							editor.isActive("highlight") ? "bg-yellow-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleHighlight()
							.run()}
						title="Highlight"
						type="button"
					>
						<span className="bg-yellow-300 px-1 rounded">H</span>
					</button>
					<div className="w-px h-4 bg-gray-300 mx-0.5" />
					<button
						className="flex items-center gap-1 p-1.5 rounded hover:bg-blue-100 text-blue-600 text-xs font-medium"
						onClick={handleCommentClick}
						title="Add Comment"
						type="button"
					>
						<svg 
							fill="none" 
							height="12" 
							stroke="currentColor" 
							strokeWidth="2" 
							viewBox="0 0 24 24" 
							width="12"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
						Comment
					</button>
					<button
						className="flex items-center gap-1 p-1.5 rounded hover:bg-green-100 text-green-600 text-xs font-medium"
						onClick={handleRevisionClick}
						title="AI Revision"
						type="button"
					>
						<svg 
							fill="none" 
							height="12" 
							stroke="currentColor" 
							strokeWidth="2" 
							viewBox="0 0 24 24" 
							width="12"
						>
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
						AI Revision
					</button>
				</div>
			) : showCommentInput ? (
				<div className="space-y-2 p-2">
					<div className="text-sm font-medium text-gray-700">Add Comment</div>
					<Textarea
						className="min-h-[50px] text-sm"
						onChange={(e) => setCommentText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								handleSubmitComment();
							}
							if (e.key === "Escape") {
								e.preventDefault();
								handleCancelComment();
							}
						}}
						placeholder="Write your comment..."
						ref={textareaRef}
						value={commentText}
					/>
					<div className="flex gap-2">
						<Button 
							disabled={!commentText.trim()} 
							onClick={handleSubmitComment}
							size="sm"
						>
							Add Comment
						</Button>
						<Button 
							onClick={handleCancelComment}
							size="sm"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
					<div className="text-xs text-gray-500">
						Press Ctrl+Enter to submit, Esc to cancel
					</div>
				</div>
			) : (
				<div className="space-y-2 p-2">
					<div className="text-sm font-medium text-gray-700">AI Revision</div>
					<Textarea
						className="min-h-[50px] text-sm"
						disabled={isLoading}
						onChange={(e) => setUserComments(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								handleSubmitRevision();
							}
							if (e.key === "Escape") {
								e.preventDefault();
								handleCancelRevision();
							}
						}}
						placeholder="Describe how you want the selected content to be revised..."
						ref={commentsTextareaRef}
						value={userComments}
					/>
					<div className="flex gap-2">
						<Button 
							className="bg-green-600 hover:bg-green-700" 
							disabled={!userComments.trim() || isLoading}
							onClick={handleSubmitRevision}
							size="sm"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<svg 
										className="animate-spin h-4 w-4" 
										fill="none" 
										viewBox="0 0 24 24" 
										xmlns="http://www.w3.org/2000/svg"
									>
										<circle 
											className="opacity-25" 
											cx="12" 
											cy="12" 
											r="10" 
											stroke="currentColor" 
											strokeWidth="4"
										/>
										<path 
											className="opacity-75" 
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
											fill="currentColor"
										/>
									</svg>
									Processing...
								</div>
							) : (
								"Apply AI Revision"
							)}
						</Button>
						<Button 
							disabled={isLoading}
							onClick={handleCancelRevision}
							size="sm"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
					<div className="text-xs text-gray-500">
						Press Ctrl+Enter to apply, Esc to cancel
					</div>
				</div>
			)}
		</div>
	);
};

export default EditorBubbleMenu; 