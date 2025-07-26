import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, CheckCircle, X, Plus, Undo2, Trash2 } from "lucide-react";
import { useEditorStore } from "@/hooks/useEditorStore";
import { useStore } from "@/utils/store";

interface Comment {
  id: string;
  content: string;
  author?: string;
  createdAt?: Date;
  data?: Record<string, any>;
}

interface Thread {
  id: string;
  comments: Comment[];
  resolvedAt?: Date;
  createdAt: Date;
  selectedText?: string;
  from?: number;
  to?: number;
}

interface CommentsPanelProps {
  // Optional callback for external notifications
  onCommentsChange?: (threads: Thread[]) => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
	onCommentsChange,
}) => {
	// Get all state and functions from the store
	const {
		threads,
		selectedThread,
		showUnresolved,
		isCommentsVisible,
		setSelectedThread,
		setShowUnresolved,
		setCommentsVisible,
		createThread,
		createGeneralComment,
		deleteThread,
		resolveThread,
		unresolveThread,
		updateComment,
	} = useEditorStore();

	// Get user info for comments
	const { session } = useStore();
	const userEmail = session?.user?.email || "Anonymous";

	const [newComment, setNewComment] = useState("");
	const [showNewCommentForm, setShowNewCommentForm] = useState(false);
	const [newThreadComment, setNewThreadComment] = useState("");

	const handleAddComment = (threadId: string) => {
		if (newComment.trim()) {
			const commentId = `comment-${Date.now()}`;
			updateComment(threadId, commentId, newComment.trim(), userEmail);
			setNewComment("");
			// Notify parent of changes if callback provided
			if (onCommentsChange) {
				onCommentsChange(threads);
			}
		}
	};

	const handleCreateNewThread = () => {
		if (newThreadComment.trim()) {
			createGeneralComment(newThreadComment.trim(), userEmail);
			setNewThreadComment("");
			setShowNewCommentForm(false);
			// Notify parent of changes if callback provided
			if (onCommentsChange) {
				onCommentsChange(threads);
			}
		}
	};

	return (
		<>
			{/* New Comment Form - Floating Side Popup */}
			{showNewCommentForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div 
						className="absolute inset-0 bg-black/50" 
						onClick={() => {
							setNewThreadComment("");
							setShowNewCommentForm(false);
						}}
					/>
					{/* Popup */}
					<div className="relative bg-background border border-gray-200 rounded-lg shadow-lg w-96 max-w-[90vw] p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-semibold flex items-center gap-2">
								<MessageCircle className="h-4 w-4" />
								Add New Comment
							</h3>
							<Button
								className="h-6 w-6 p-0"
								onClick={() => {
									setNewThreadComment("");
									setShowNewCommentForm(false);
								}}
								size="sm"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
						<div className="space-y-4">
							<Textarea
								autoFocus
								className="min-h-[120px] text-sm"
								onChange={(e) => setNewThreadComment(e.target.value)}
								placeholder="Write your comment..."
								value={newThreadComment}
							/>
							<div className="flex gap-2 justify-end">
								<Button 
									onClick={() => {
										setNewThreadComment("");
										setShowNewCommentForm(false);
									}} 
									size="sm"
									variant="outline"
								>
									Cancel
								</Button>
								<Button 
									disabled={!newThreadComment.trim()} 
									onClick={handleCreateNewThread}
									size="sm"
								>
									Create Comment
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className="w-80 absolute top-16 left-4 bg-background border-gray-200 border-l border-r border-b rounded-b-lg p-2">
				<div className="p-4 border-b">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold flex items-center gap-2">
							<MessageCircle className="h-4 w-4" />
							Comments
						</h3>
						<div className="flex items-center gap-2">
							<Button
								className="h-7 px-2"
								onClick={() => setShowNewCommentForm(!showNewCommentForm)}
								size="sm"
								title="Add new comment"
								variant="outline"
							>
								<Plus className="h-3 w-3 mr-1" />
								Add
							</Button>
							<Button
								className="h-6 w-6 p-0"
								onClick={() => setCommentsVisible(false)}
								size="sm"
								title="Close comments"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					</div>
				</div>
				<Tabs 
					className="flex-1 flex flex-col" 
					defaultValue={showUnresolved ? "open" : "resolved"}
					onValueChange={(value) => setShowUnresolved(value === "open")}
					value={showUnresolved ? "open" : "resolved"}
				>
					<div className="px-4 pt-3">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger className="flex items-center gap-2" value="open">
							Open
								<Badge className="ml-auto" variant="secondary">
									{threads.filter((thread) => !thread.resolvedAt).length}
								</Badge>
							</TabsTrigger>
							<TabsTrigger className="flex items-center gap-2" value="resolved">
							Resolved
								<Badge className="ml-auto" variant="secondary">
									{threads.filter((thread) => !!thread.resolvedAt).length}
								</Badge>
							</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent className="flex-1 mt-0" value="open">
						<ScrollArea className="h-[65vh] px-4">
							<div className="space-y-3 pt-3">
								{threads.filter((thread) => !thread.resolvedAt).reverse()
									.map((thread) => (
										<Card
											className={`cursor-pointer transition-colors ${
												selectedThread === thread.id ? "border-2 border-primary" : ""
											}`}
											key={thread.id}
											onClick={() => setSelectedThread(thread.id)}
											onMouseEnter={() => {}} // No-op for now
											onMouseLeave={() => {}} // No-op for now
										>
											<CardHeader className="pb-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Badge className="text-xs" variant={thread.resolvedAt ? "secondary" : "default"}>
															{thread.resolvedAt ? "Resolved" : "Open"}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{thread.createdAt.toLocaleDateString()}
														</span>
													</div>
													<div className="flex items-center gap-1">
														{thread.resolvedAt ? (
															<Button
																className="h-6 w-6 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	unresolveThread(thread.id);
																	if (onCommentsChange) {
																		onCommentsChange(threads);
																	}
																}}
																size="sm"
																title="Unresolve comment"
																variant="ghost"
															>
																<Undo2 className="h-3 w-3" />
															</Button>
														) : (
															<Button
																className="h-6 w-6 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	resolveThread(thread.id);
																	if (onCommentsChange) {
																		onCommentsChange(threads);
																	}
																}}
																size="sm"
																title="Resolve comment"
																variant="ghost"
															>
																<CheckCircle className="h-3 w-3" />
															</Button>
														)}
														<Button
															className="h-6 w-6 p-0 text-destructive hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																deleteThread(thread.id);
																if (onCommentsChange) {
																	onCommentsChange(threads);
																}
															}}
															size="sm"
															title="Delete comment"
															variant="ghost"
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="pt-0">
												{thread.selectedText && (
													<div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
														<div className="text-xs font-medium text-blue-700 mb-1">
													Selected text:
														</div>
														<div className="text-sm text-blue-800 italic">
													&ldquo;{thread.selectedText}&rdquo;
														</div>
													</div>
												)}
												<div className="space-y-2">
													{thread.comments.map((comment) => (
														<div className="text-sm" key={comment.id}>
															<div className="font-medium text-xs text-muted-foreground mb-1">
																{comment.author || "Anonymous"}
															</div>
															<div className="text-foreground">
																{comment.content}
															</div>
														</div>
													))}
												</div>        
												{selectedThread === thread.id && (
													<div className="mt-3 pt-3 border-t">
														<Textarea
															className="min-h-[60px] text-sm"
															onChange={(e) => setNewComment(e.target.value)}
															placeholder="Add a reply..."
															value={newComment}
														/>
														<div className="flex gap-2 mt-2">
															<Button 
																disabled={!newComment.trim()} 
																onClick={() => handleAddComment(thread.id)}
																size="sm"
															>
														Reply
															</Button>
															<Button 
																onClick={() => {
																	setNewComment("");
																	setSelectedThread(null);
																}} 
																size="sm"
																variant="outline"
															>
														Cancel
															</Button>
														</div>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								{threads.filter((thread) => !thread.resolvedAt).length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
										<p className="text-sm">No open comments</p>
									</div>
								)}
							</div>
						</ScrollArea>
					</TabsContent>
					<TabsContent className="flex-1 mt-0" value="resolved">
						<ScrollArea className="h-[60vh] px-4">
							<div className="space-y-3 pt-3">
								{threads.filter((thread) => !!thread.resolvedAt).reverse()
									.map((thread) => (
										<Card
											className={`cursor-pointer transition-colors ${
												selectedThread === thread.id ? "ring-2 ring-primary" : ""
											}`}
											key={thread.id}
											onClick={() => setSelectedThread(thread.id)}
											onMouseEnter={() => {}} // No-op
											onMouseLeave={() => {}} // No-op
										>
											<CardHeader className="pb-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Badge className="text-xs" variant="secondary">
													Resolved
														</Badge>
														<span className="text-xs text-muted-foreground">
															{thread.createdAt.toLocaleDateString()}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<Button
															className="h-6 w-6 p-0"
															onClick={(e) => {
																e.stopPropagation();
																unresolveThread(thread.id);
																if (onCommentsChange) {
																	onCommentsChange(threads);
																}
															}}
															size="sm"
															title="Unresolve comment"
															variant="ghost"
														>
															<Undo2 className="h-3 w-3" />
														</Button>
														<Button
															className="h-6 w-6 p-0 text-destructive hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																deleteThread(thread.id);
																if (onCommentsChange) {
																	onCommentsChange(threads);
																}
															}}
															size="sm"
															title="Delete comment"
															variant="ghost"
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent className="pt-0">
												{thread.selectedText && (
													<div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
														<div className="text-xs font-medium text-blue-700 mb-1">
													Selected text:
														</div>
														<div className="text-sm text-blue-800 italic">
													&ldquo;{thread.selectedText}&rdquo;
														</div>
													</div>
												)}
												<div className="space-y-2">
													{thread.comments.map((comment) => (
														<div className="text-sm" key={comment.id}>
															<div className="font-medium text-xs text-muted-foreground mb-1">
																{comment.author || "Anonymous"}
															</div>
															<div className="text-foreground">
																{comment.content}
															</div>
														</div>
													))}
												</div>        
												{selectedThread === thread.id && (
													<div className="mt-3 pt-3 border-t">
														<Textarea
															className="min-h-[60px] text-sm"
															onChange={(e) => setNewComment(e.target.value)}
															placeholder="Add a reply..."
															value={newComment}
														/>
														<div className="flex gap-2 mt-2">
															<Button 
																disabled={!newComment.trim()} 
																onClick={() => handleAddComment(thread.id)}
																size="sm"
															>
														Reply
															</Button>
															<Button 
																onClick={() => {
																	setNewComment("");
																	setSelectedThread(null);
																}} 
																size="sm"
																variant="outline"
															>
														Cancel
															</Button>
														</div>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								{threads.filter((thread) => !!thread.resolvedAt).length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
										<p className="text-sm">No resolved comments</p>
									</div>
								)}
							</div>
						</ScrollArea>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
};

export default CommentsPanel; 