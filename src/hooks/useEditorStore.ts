import { create } from "zustand";
import { type Editor } from "@tiptap/react";
import { CommentAPI, type Thread as BackendThread, type Comment as BackendComment } from "@/api/commentRoutes";

// UUID validation helper function
const isValidUUID = (str: string): boolean => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
};

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
  from_position?: number;
  to_position?: number;
}

interface EditorStore {
	// Document and thread state
	currentDocumentId: string | null;
	currentProjectAccessId: string | null;
	documentThreads: Record<string, Thread[]>; // threads per document
	selectedThread: string | null;
	showUnresolved: boolean;
	isCommentsVisible: boolean;

	// Loading and error states
	isLoading: boolean;
	error: string | null;

	// Current document computed state
	threads: Thread[]; // threads for current document

	// Document actions
	setCurrentDocument: (documentId: string | null, projectAccessId?: string | null) => void;
	setSelectedThread: (threadId: string | null) => void;
	setShowUnresolved: (show: boolean) => void;
	setCommentsVisible: (visible: boolean) => void;

	// API operations
	fetchThreads: (documentId: string, projectAccessId: string) => Promise<void>;
	createThread: (editor: Editor, commentText: string, userEmail: string, forceCreate?: boolean) => Promise<void>;
	createGeneralComment: (commentText: string, userEmail: string) => Promise<void>;
	deleteThread: (threadId: string, editor?: Editor) => Promise<void>;
	resolveThread: (threadId: string, editor?: Editor) => Promise<void>;
	unresolveThread: (threadId: string, editor?: Editor) => Promise<void>;
	updateComment: (threadId: string, commentId: string, content: string, userEmail: string) => Promise<void>;

	// Utility functions
	getOpenThreads: () => Thread[];
	getResolvedThreads: () => Thread[];
	clearDocumentThreads: (documentId?: string) => void;
	clearAllDocuments: () => void;
}

// Utility functions to convert between frontend and backend formats
const convertBackendToFrontend = (backendThread: BackendThread): Thread => {
	return {
		...backendThread,
		createdAt: new Date(backendThread.created_at),
		resolvedAt: backendThread.resolved_at ? new Date(backendThread.resolved_at) : undefined,
		comments: backendThread.comments.map((comment) => ({
			...comment,
			createdAt: comment.created_at ? new Date(comment.created_at) : new Date(),
		})),
	};
};

const convertFrontendToBackend = (frontendThread: Thread): BackendThread => {
	return {
		...frontendThread,
		created_at: frontendThread.createdAt.toISOString(),
		resolved_at: frontendThread.resolvedAt?.toISOString(),
		comments: frontendThread.comments.map((comment) => ({
			...comment,
			created_at: comment.createdAt?.toISOString() || new Date().toISOString(),
		})),
	};
};

export const useEditorStore = create<EditorStore>((set, get) => ({
	// Initial state
	currentDocumentId: null,
	currentProjectAccessId: null,
	documentThreads: {},
	selectedThread: null,
	showUnresolved: true,
	isCommentsVisible: false,
	isLoading: false,
	error: null,

	// Computed state - threads for current document  
	threads: [], // Will be computed based on currentDocumentId

	// Document management
	setCurrentDocument: (documentId, projectAccessId) => {
		const { selectedThread, setSelectedThread, documentThreads } = get();
		// Clear selected thread when switching documents
		if (selectedThread) {
			setSelectedThread(null);
		}
		// Update threads for the new document
		const threads = documentId ? (documentThreads[documentId] || []) : [];
		set({ 
			currentDocumentId: documentId, 
			currentProjectAccessId: projectAccessId || null,
			threads,
			error: null,
		});

		// Fetch threads from API if we have both documentId and projectAccessId, and documentId is a valid UUID
		if (documentId && projectAccessId && isValidUUID(documentId)) {
			get().fetchThreads(documentId, projectAccessId);
		}
	},

	// API operations
	fetchThreads: async(documentId, projectAccessId) => {
		set({ isLoading: true, error: null });
		try {
			const backendThreads = await CommentAPI.getDocumentThreads(projectAccessId, documentId);
			const frontendThreads = backendThreads.map(convertBackendToFrontend);
			
			const { documentThreads } = get();
			set({
				documentThreads: {
					...documentThreads,
					[documentId]: frontendThreads,
				},
				threads: frontendThreads,
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to fetch threads:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to fetch comments",
				isLoading: false,
			});
		}
	},

	setSelectedThread: (selectedThread) => set({ selectedThread }),
	setShowUnresolved: (showUnresolved) => set({ showUnresolved }),
	setCommentsVisible: (isCommentsVisible) => set({ isCommentsVisible }),

	// Thread operations
	createThread: async(editor, commentText, userEmail, forceCreate = false) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads } = get();
		if (!currentDocumentId || !currentProjectAccessId) return;

		// Only require selection if this is coming from toolbar (forceCreate = false)
		if (!forceCreate && editor.state.selection.empty) {
			return;
		}

		set({ isLoading: true, error: null });

		try {
			// Create thread manually with custom implementation
			const threadId = `thread-${Date.now()}`;
			let from_position, to_position, selectedText;

			if (editor.state.selection.empty) {
				// If no selection, create a general comment at the end of document
				from_position = editor.state.doc.content.size;
				to_position = from_position;
				selectedText = "(General comment)";
			} else {
				from_position = editor.state.selection.from;
				to_position = editor.state.selection.to;
				selectedText = editor.state.doc.textBetween(from_position, to_position);
			}

			// Create a thread manually in the threads array
			const newThread: Thread = {
				id: threadId,
				comments: [{
					id: `comment-${Date.now()}`,
					content: commentText,
					author: userEmail,
					createdAt: new Date(),
				}],
				createdAt: new Date(),
				from_position,
				to_position,
				selectedText,
				resolvedAt: undefined,
			};

			// Apply highlighting to the selected text (only if there's actual text selection)
			if (!editor.state.selection.empty) {
				editor.chain()
					.setTextSelection({ from: from_position, to: to_position })
					.setHighlight({ color: "#fff3cd" }) // Light yellow highlight for comments
					.run();
			}

			// Convert to backend format and send to API
			const backendThread = convertFrontendToBackend(newThread);
			await CommentAPI.createDocumentThread(currentProjectAccessId, {
				thread: backendThread,
				resource_id: currentDocumentId,
			});

			// Update threads for current document
			const currentThreads = documentThreads[currentDocumentId] || [];
			const updatedThreads = [...currentThreads, newThread];
	    
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				selectedThread: threadId,
				isCommentsVisible: true, // Automatically show comments panel when a new comment is created
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to create thread:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to create comment",
				isLoading: false,
			});
		}
	},

	createGeneralComment: async(commentText, userEmail) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads } = get();

		if (!currentDocumentId || !currentProjectAccessId) return;

		set({ isLoading: true, error: null });

		try {
			// Create thread manually for general comments (no editor needed)
			const threadId = `thread-${Date.now()}`;

			const newThread: Thread = {
				id: threadId,
				comments: [{
					id: `comment-${Date.now()}`,
					content: commentText,
					author: userEmail,
					createdAt: new Date(),
				}],
				createdAt: new Date(),
				from_position: undefined, // No position for general comments
				to_position: undefined,
				selectedText: "(General comment)",
				resolvedAt: undefined,
			};

			// Convert to backend format and send to API
			const backendThread = convertFrontendToBackend(newThread);
			await CommentAPI.createDocumentThread(currentProjectAccessId, {
				thread: backendThread,
				resource_id: currentDocumentId,
			});

			// Update threads for current document
			const currentThreads = documentThreads[currentDocumentId] || [];
			const updatedThreads = [...currentThreads, newThread];
	    
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				selectedThread: threadId,
				isCommentsVisible: true, // Automatically show comments panel when a new comment is created
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to create general comment:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to create comment",
				isLoading: false,
			});
		}
	},

	deleteThread: async(threadId, editor) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads, selectedThread } = get();
		if (!currentDocumentId || !currentProjectAccessId) return;

		set({ isLoading: true, error: null });

		try {
			const currentThreads = documentThreads[currentDocumentId] || [];
	    
			// Find the thread to get its position before deleting
			const threadToDelete = currentThreads.find((thread) => thread.id === threadId);
	    
			// Remove highlight from the text if thread has valid position
			if (editor && threadToDelete && threadToDelete.from_position !== undefined && threadToDelete.to_position !== undefined && threadToDelete.from_position !== threadToDelete.to_position) {
				editor.chain()
					.setTextSelection({ from: threadToDelete.from_position, to: threadToDelete.to_position })
					.unsetHighlight()
					.run();
			}

			// Delete from API
			await CommentAPI.deleteDocumentThread(currentProjectAccessId, {
				resource_id: currentDocumentId,
				thread_id: threadId,
			});
	     
			// Update threads for current document
			const updatedThreads = currentThreads.filter((thread) => thread.id !== threadId);
	      
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				selectedThread: selectedThread === threadId ? null : selectedThread,
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to delete thread:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to delete comment",
				isLoading: false,
			});
		}
	},

	resolveThread: async(threadId, editor) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads } = get();
		if (!currentDocumentId || !currentProjectAccessId) return;

		set({ isLoading: true, error: null });

		try {
			const currentThreads = documentThreads[currentDocumentId] || [];
	     
			// Find the thread to get its position before resolving
			const threadToResolve = currentThreads.find((thread) => thread.id === threadId);
	     
			// Remove highlight from the text when resolving if thread has valid position
			if (editor && threadToResolve && threadToResolve.from_position !== undefined && threadToResolve.to_position !== undefined && threadToResolve.from_position !== threadToResolve.to_position) {
				editor.chain()
					.setTextSelection({ from: threadToResolve.from_position, to: threadToResolve.to_position })
					.unsetHighlight()
					.run();
			}

			// Get the first comment in the thread to update
			const firstComment = threadToResolve?.comments[0];
			if (!firstComment) {
				throw new Error("Thread has no comments");
			}

			// Update comment with resolved timestamp via API
			await CommentAPI.updateDocumentComment(currentProjectAccessId, {
				resource_id: currentDocumentId,
				thread_id: threadId,
				comment_id: firstComment.id,
				resolved_at: new Date().toISOString(),
			});
	     
			// Update threads for current document
			const updatedThreads = currentThreads.map((thread) => 
				thread.id === threadId 
					? { ...thread, resolvedAt: new Date() }
					: thread,
			);
	      
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to resolve thread:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to resolve comment",
				isLoading: false,
			});
		}
	},

	unresolveThread: async(threadId, editor) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads } = get();
		if (!currentDocumentId || !currentProjectAccessId) return;

		set({ isLoading: true, error: null });

		try {
			const currentThreads = documentThreads[currentDocumentId] || [];
	     
			// Find the thread to get its position before unresolving
			const threadToUnresolve = currentThreads.find((thread) => thread.id === threadId);
	     
			// Re-add highlight to the text when unresolving if thread has valid position
			if (editor && threadToUnresolve && threadToUnresolve.from_position !== undefined && threadToUnresolve.to_position !== undefined && threadToUnresolve.from_position !== threadToUnresolve.to_position) {
				editor.chain()
					.setTextSelection({ from: threadToUnresolve.from_position, to: threadToUnresolve.to_position })
					.setHighlight({ color: "#fff3cd" }) // Same light yellow highlight for comments
					.run();
			}

			// Get the first comment in the thread to update
			const firstComment = threadToUnresolve?.comments[0];
			if (!firstComment) {
				throw new Error("Thread has no comments");
			}

			// Update comment to remove resolved timestamp via API
			await CommentAPI.updateDocumentComment(currentProjectAccessId, {
				resource_id: currentDocumentId,
				thread_id: threadId,
				comment_id: firstComment.id,
				resolved_at: undefined,
			});
	     
			// Update threads for current document
			const updatedThreads = currentThreads.map((thread) => 
				thread.id === threadId 
					? { ...thread, resolvedAt: undefined }
					: thread,
			);
	      
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to unresolve thread:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to unresolve comment",
				isLoading: false,
			});
		}
	},

	updateComment: async(threadId, commentId, content, userEmail) => {
		const { currentDocumentId, currentProjectAccessId, documentThreads } = get();
		if (!currentDocumentId || !currentProjectAccessId) return;

		set({ isLoading: true, error: null });

		try {
			const currentThreads = documentThreads[currentDocumentId] || [];
	     
			const existingThread = currentThreads.find((thread) => thread.id === threadId);
			const existingComment = existingThread?.comments.find((c) => c.id === commentId);

			if (existingComment) {
				// Update existing comment via API
				await CommentAPI.updateDocumentComment(currentProjectAccessId, {
					resource_id: currentDocumentId,
					thread_id: threadId,
					comment_id: commentId,
					content,
				});
			} else {
				// Add new comment/reply via API
				await CommentAPI.addCommentToThread(currentProjectAccessId, {
					resource_id: currentDocumentId,
					thread_id: threadId,
					comment: {
						id: commentId,
						content,
						author: userEmail,
						created_at: new Date().toISOString(),
					},
				});
			}

			const updatedThreads = currentThreads.map((thread) => {
				if (thread.id === threadId) {
					if (existingComment) {
						// Update existing comment
						return {
							...thread,
							comments: thread.comments.map((comment) =>
								comment.id === commentId
									? { ...comment, content }
									: comment,
							),
						};
					} else {
						// Add new comment/reply
						return {
							...thread,
							comments: [
								...thread.comments,
								{
									id: commentId,
									content,
									author: userEmail,
									createdAt: new Date(),
								},
							],
						};
					}
				}
				return thread;
			});
	     
			set({ 
				documentThreads: {
					...documentThreads,
					[currentDocumentId]: updatedThreads,
				},
				threads: updatedThreads, // Update the computed threads property
				isCommentsVisible: true, // Ensure comments panel is visible when adding a reply
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to update comment:", error);
			set({ 
				error: error instanceof Error ? error.message : "Failed to update comment",
				isLoading: false,
			});
		}
	},

	// Utility functions
	getOpenThreads: () => {
		const store = get();
		const threads = store.threads;
		return threads.filter((thread) => !thread.resolvedAt);
	},

	getResolvedThreads: () => {
		const store = get();
		const threads = store.threads;
		return threads.filter((thread) => !!thread.resolvedAt);
	},

	clearDocumentThreads: (documentId) => {
		const { currentDocumentId, documentThreads } = get();
		const targetId = documentId || currentDocumentId;
		if (!targetId) return;
		
		const updatedDocumentThreads = { ...documentThreads };
		delete updatedDocumentThreads[targetId];
		
		set({ 
			documentThreads: updatedDocumentThreads,
			threads: targetId === currentDocumentId ? [] : get().threads, // Clear threads if clearing current document
			selectedThread: null,
		});
	},

	clearAllDocuments: () => set({ 
		documentThreads: {}, 
		threads: [], // Clear current threads
		currentDocumentId: null,
		selectedThread: null,
	}),
}));
