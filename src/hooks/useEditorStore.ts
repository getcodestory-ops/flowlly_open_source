import { create } from "zustand";
import { type Editor } from "@tiptap/react";

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

interface EditorStore {
	// Document and thread state
	currentDocumentId: string | null;
	documentThreads: Record<string, Thread[]>; // threads per document
	selectedThread: string | null;
	showUnresolved: boolean;
	isCommentsVisible: boolean;

	// Current document computed state
	threads: Thread[]; // threads for current document

	// Document actions
	setCurrentDocument: (documentId: string | null) => void;
	setSelectedThread: (threadId: string | null) => void;
	setShowUnresolved: (show: boolean) => void;
	setCommentsVisible: (visible: boolean) => void;

	// Thread operations
	createThread: (editor: Editor, commentText: string, userEmail: string, forceCreate?: boolean) => void;
	createGeneralComment: (commentText: string, userEmail: string) => void;
	deleteThread: (threadId: string, editor?: Editor) => void;
	resolveThread: (threadId: string, editor?: Editor) => void;
	unresolveThread: (threadId: string, editor?: Editor) => void;
	updateComment: (threadId: string, commentId: string, content: string, userEmail: string) => void;

	// Utility functions
	getOpenThreads: () => Thread[];
	getResolvedThreads: () => Thread[];
	clearDocumentThreads: (documentId?: string) => void;
	clearAllDocuments: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
	// Initial state
	currentDocumentId: null,
	documentThreads: {},
	selectedThread: null,
	showUnresolved: true,
	isCommentsVisible: false,

	// Computed state - threads for current document  
	threads: [], // Will be computed based on currentDocumentId

	// Document management
	setCurrentDocument: (documentId) => {
		const { selectedThread, setSelectedThread, documentThreads } = get();
		// Clear selected thread when switching documents
		if (selectedThread) {
			setSelectedThread(null);
		}
		// Update threads for the new document
		const threads = documentId ? (documentThreads[documentId] || []) : [];
		set({ currentDocumentId: documentId, threads });
	},
	setSelectedThread: (selectedThread) => set({ selectedThread }),
	setShowUnresolved: (showUnresolved) => set({ showUnresolved }),
	setCommentsVisible: (isCommentsVisible) => set({ isCommentsVisible }),

	// Thread operations
	createThread: (editor, commentText, userEmail, forceCreate = false) => {
		const { currentDocumentId, documentThreads } = get();
		if (!currentDocumentId) return;

		// Only require selection if this is coming from toolbar (forceCreate = false)
		if (!forceCreate && editor.state.selection.empty) {
			return;
		}

		// Create thread manually with custom implementation
		const threadId = `thread-${Date.now()}`;
		let from, to, selectedText;

		if (editor.state.selection.empty) {
			// If no selection, create a general comment at the end of document
			from = editor.state.doc.content.size;
			to = from;
			selectedText = "(General comment)";
		} else {
			from = editor.state.selection.from;
			to = editor.state.selection.to;
			selectedText = editor.state.doc.textBetween(from, to);
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
			from,
			to,
			selectedText,
			resolvedAt: undefined,
		};

		// Apply highlighting to the selected text (only if there's actual text selection)
		if (!editor.state.selection.empty) {
			editor.chain()
				.setTextSelection({ from, to })
				.setHighlight({ color: "#fff3cd" }) // Light yellow highlight for comments
				.run();
		}

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
		});
	},

	createGeneralComment: (commentText, userEmail) => {
		const { currentDocumentId, documentThreads } = get();
		if (!currentDocumentId) return;

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
			from: undefined, // No position for general comments
			to: undefined,
			selectedText: "(General comment)",
			resolvedAt: undefined,
		};

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
		});
	},

	deleteThread: (threadId, editor) => {
		const { currentDocumentId, documentThreads, selectedThread } = get();
		if (!currentDocumentId) return;

		const currentThreads = documentThreads[currentDocumentId] || [];
    
		// Find the thread to get its position before deleting
		const threadToDelete = currentThreads.find((thread) => thread.id === threadId);
    
		// Remove highlight from the text if thread has valid position
		if (editor && threadToDelete && threadToDelete.from !== undefined && threadToDelete.to !== undefined && threadToDelete.from !== threadToDelete.to) {
			editor.chain()
				.setTextSelection({ from: threadToDelete.from, to: threadToDelete.to })
				.unsetHighlight()
				.run();
		}
     
		// Update threads for current document
		const updatedThreads = currentThreads.filter((thread) => thread.id !== threadId);
      
		set({ 
			documentThreads: {
				...documentThreads,
				[currentDocumentId]: updatedThreads,
			},
			threads: updatedThreads, // Update the computed threads property
			selectedThread: selectedThread === threadId ? null : selectedThread,
		});
	},

	resolveThread: (threadId, editor) => {
		const { currentDocumentId, documentThreads } = get();
		if (!currentDocumentId) return;

		const currentThreads = documentThreads[currentDocumentId] || [];
     
		// Find the thread to get its position before resolving
		const threadToResolve = currentThreads.find((thread) => thread.id === threadId);
     
		// Remove highlight from the text when resolving if thread has valid position
		if (editor && threadToResolve && threadToResolve.from !== undefined && threadToResolve.to !== undefined && threadToResolve.from !== threadToResolve.to) {
			editor.chain()
				.setTextSelection({ from: threadToResolve.from, to: threadToResolve.to })
				.unsetHighlight()
				.run();
		}
     
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
		});
	},

	unresolveThread: (threadId, editor) => {
		const { currentDocumentId, documentThreads } = get();
		if (!currentDocumentId) return;

		const currentThreads = documentThreads[currentDocumentId] || [];
     
		// Find the thread to get its position before unresolving
		const threadToUnresolve = currentThreads.find((thread) => thread.id === threadId);
     
		// Re-add highlight to the text when unresolving if thread has valid position
		if (editor && threadToUnresolve && threadToUnresolve.from !== undefined && threadToUnresolve.to !== undefined && threadToUnresolve.from !== threadToUnresolve.to) {
			editor.chain()
				.setTextSelection({ from: threadToUnresolve.from, to: threadToUnresolve.to })
				.setHighlight({ color: "#fff3cd" }) // Same light yellow highlight for comments
				.run();
		}
     
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
		});
	},

	updateComment: (threadId, commentId, content, userEmail) => {
		const { currentDocumentId, documentThreads } = get();
		if (!currentDocumentId) return;

		const currentThreads = documentThreads[currentDocumentId] || [];
     
		const updatedThreads = currentThreads.map((thread) => {
			if (thread.id === threadId) {
				const existingComment = thread.comments.find((c: any) => c.id === commentId);
         
				if (existingComment) {
					// Update existing comment
					return {
						...thread,
						comments: thread.comments.map((comment: any) =>
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
		});
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
