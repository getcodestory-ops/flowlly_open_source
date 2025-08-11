import { create } from "zustand";

interface SidePanel {
	id: string;
	isOpen: boolean;
	type: "sources" | "editor" | "pdfViewer" | "log" | "folder" | "sandbox";
	resourceId: string;
	filename?: string;
	title?: string;
	contextId?: string;
	// Force reload timestamp for content refresh
	lastReloadTime?: number;
}

interface ChatStore {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	// Legacy single panel support for backward compatibility
	sidePanel: SidePanel | null;
	setSidePanel: (sidePanel: Omit<SidePanel, "id"> | null) => void;
	// New multi-tab support
	tabs: SidePanel[];
	activeTabId: string | null;
	isWaitingForResponse: boolean;
	setIsWaitingForResponse: (isWaitingForResponse: boolean) => void;	
	addTab: (tab: Omit<SidePanel, "id">, forceReload?: boolean) => void;
	removeTab: (tabId: string) => void;
	setActiveTab: (tabId: string) => void;
	clearAllTabs: () => void;
	documentDisplayMap: { [resourceId: string]: string };
	setDocumentDisplayMap: (resourceId: string, chatId: string) => void;
	clearDocumentDisplayMap: () => void;
	selectedContexts: {
		[chatId: string]: {
			id: string;
			name: string;
			extension: string;
		}[];
	};
	setSelectedContexts: (chatId: string, contexts: {
		id: string;
		name: string;
		extension: string;
	}[]) => void;
	replaceUntitledChatId: (newChatId: string) => void;
	// Context folder for chat
	contextFolder: {
		id: string | null;
		name: string;
	};
	setContextFolder: (folderId: string | null, folderName: string) => void;
	chatInput: string;
	setChatInput: (input: string) => void;
	// Chat context for specialized forms (bid levelling, etc.)
	chatContext: string;
	setChatContext: (context: string) => void;
	clearChatContext: () => void;
	// Get combined message (chatInput + chatContext)
	getCombinedMessage: () => string;
	chatDirectiveType: "chat" | "bidLevelling" | "dailyReport" | "reportWriting" | "knowledgeManager" | "meetingChat" | "none";
	setChatDirectiveType: (directiveType: "chat" | "bidLevelling" | "dailyReport" | "reportWriting" | "knowledgeManager" | "meetingChat" | "none") => void;
	selectedModel: string;
	setSelectedModel: (model: string) => void;
	// Chat type tags for new chats
	chatTypeTags: {
		name: string;
		parent: string;
	}[];
	setChatTypeTags: (tags: { name: string; parent: string; }[]) => void;
	clearChatTypeTags: () => void;

	setMeetingChatTags: (meetingName: string) => void;
	// Set meeting chat directive with specific meeting ID
	setMeetingChatDirective: (meetingId?: string) => void;
	// Store selected meeting ID for meeting chat
	selectedMeetingId: string | null;
	setSelectedMeetingId: (meetingId: string | null) => void;
	// Store complete meeting workflow data (meeting type + instance)
	meetingWorkflowData: { meetingType: any; meetingInstance: any } | null;
	setMeetingWorkflowData: (data: { meetingType: any; meetingInstance: any } | null) => void;
	// Track if we're coming from MeetingChatFromMeetingInstance
	isFromMeetingInstance: boolean;
	setIsFromMeetingInstance: (value: boolean) => void;
	// Reset function for new chats
	resetForNewChat: () => void;
}

const generateTabId = (): string => `tab_${Date.now()}_${Math.random().toString(36)
	.substr(2, 9)}`;

export const useChatStore = create<ChatStore>((set, get) => ({
	collapsed: false,
	setCollapsed: (collapsed) => set({ collapsed }),
	sidePanel: null,
	setSidePanel: (sidePanel) => {
		if (sidePanel === null) {
			set({ sidePanel: null });
			return;
		}
		
		const tabWithId = {
			...sidePanel,
			id: generateTabId(),
		};
		
		set({ sidePanel: tabWithId });
		
		// Also add to tabs for the new interface
		const { addTab } = get();
		addTab(sidePanel, true); // Force reload for setSidePanel calls
	},
	tabs: [],
	activeTabId: null,
	isWaitingForResponse: false,
	setIsWaitingForResponse: (isWaitingForResponse) => set({ isWaitingForResponse }),
	addTab: (tab, forceReload = false) => set((state) => {
		const tabId = generateTabId();
		const newTab = {
			...tab,
			id: tabId,
			title: tab.title || tab.filename || `${tab.type} ${tab.resourceId.slice(0, 8)}`,
			lastReloadTime: Date.now(),
		};
		
		// Check if a tab with the same resourceId and type already exists
		const existingTab = state.tabs.find(
			(t) => t.resourceId === tab.resourceId && t.type === tab.type,
		);
		
		if (existingTab) {
			if (forceReload) {
				// Force reload by updating the existing tab's reload time
				const updatedTabs = state.tabs.map((t) => 
					t.id === existingTab.id 
						? { ...t, lastReloadTime: Date.now() }
						: t,
				);
				return {
					tabs: updatedTabs,
					activeTabId: existingTab.id,
				};
			} else {
				// If it exists and no force reload, just make it active
				return {
					activeTabId: existingTab.id,
				};
			}
		}
		
		// Add new tab and make it active
		return {
			tabs: [...state.tabs, newTab],
			activeTabId: tabId,
		};
	}),
	removeTab: (tabId) => set((state) => {
		const newTabs = state.tabs.filter((tab) => tab.id !== tabId);
		let newActiveTabId = state.activeTabId;
		
		// If we're removing the active tab, switch to another tab
		if (state.activeTabId === tabId) {
			if (newTabs.length > 0) {
				// Switch to the last tab or the one before the removed tab
				const removedIndex = state.tabs.findIndex((tab) => tab.id === tabId);
				newActiveTabId = newTabs[Math.min(removedIndex, newTabs.length - 1)]?.id || null;
			} else {
				newActiveTabId = null;
			}
		}
		
		return {
			tabs: newTabs,
			activeTabId: newActiveTabId,
		};
	}),
	setActiveTab: (tabId) => set({ activeTabId: tabId }),
	clearAllTabs: () => set({ tabs: [], activeTabId: null }),
	documentDisplayMap: {},
	setDocumentDisplayMap: (resourceId, chatId) => 
		set((state) => ({
			documentDisplayMap: {
				...state.documentDisplayMap,
				[resourceId]: chatId,
			},
		})),
	clearDocumentDisplayMap: () => set({ documentDisplayMap: {} }),
	selectedContexts: {},
	setSelectedContexts: (chatId, contexts) => 
		set((state) => ({
			selectedContexts: {
				...state.selectedContexts,
				[chatId]: contexts,
			},
		})),
	replaceUntitledChatId: (newChatId: string) => set((state) => {
		const untitledContexts = state.selectedContexts["untitled"];
		if (!untitledContexts) return state;

		const { ["untitled"]: _REMOVED, ...restContexts } = state.selectedContexts;
		return {
			selectedContexts: {
				...restContexts,
				[newChatId]: untitledContexts,
			},
		};
	}),
	contextFolder: {
		id: null,
		name: "",
	},
	setContextFolder: (folderId, folderName) => set({ contextFolder: { id: folderId, name: folderName } }),
	chatInput: "",
	setChatInput: (input) => set({ chatInput: input }),
	// Chat context management
	chatContext: "",
	setChatContext: (context) => set({ chatContext: context }),
	clearChatContext: () => set({ chatContext: "" }),
	// Get combined message for submission
	getCombinedMessage: () => {
		const { chatInput, chatContext } = get();
		// If there's context, prepend it to the chat input
		if (chatContext.trim()) {
			return chatContext.trim() + (chatInput.trim() ? "\n\n" + chatInput.trim() : "");
		}
		return chatInput;
	},
	chatDirectiveType: "chat",
	setChatDirectiveType: (directiveType) => {
		// Clear context when switching chat types
		set({ 
			chatDirectiveType: directiveType,
			chatContext: "",
		});
		
		// Set appropriate tags based on chat type
		const { setChatTypeTags } = get();
		switch (directiveType) {
			case "bidLevelling":
				setChatTypeTags([{ name: "bid-levelling", parent: "root" }]);
				break;
			case "dailyReport":
				setChatTypeTags([{ name: "daily-report", parent: "root" }]);
				break;
			case "reportWriting":
				setChatTypeTags([{ name: "report-writing", parent: "root" }]);
				break;
			case "knowledgeManager":
				setChatTypeTags([{ name: "knowledge-search", parent: "root" }]);
				break;
			case "meetingChat":
				setChatTypeTags([{ name: "meeting-chat", parent: "root" }]);
				break;
			default:
				setChatTypeTags([]);
				break;
		}
	},
	selectedModel: "gemini-2.5-pro",
	setSelectedModel: (model) => set({ selectedModel: model }),
	// Chat type tags management
	chatTypeTags: [],
	setChatTypeTags: (tags) => set({ chatTypeTags: tags }),
	clearChatTypeTags: () => set({ chatTypeTags: [] }),
	// Set meeting-specific tags
	setMeetingChatTags: (meetingName: string) => {
		const tags = [
			{ name: "meeting", parent: "root" },
			{ name: meetingName.toLowerCase().replace(/\s+/g, "-"), parent: "meeting" },
		];
		set({ chatTypeTags: tags });
	},
	// Set meeting chat directive with specific meeting ID
	setMeetingChatDirective: (meetingId?: string) => {
		set({ 
			chatDirectiveType: "meetingChat",
			selectedMeetingId: meetingId || null,
			chatContext: "",
		});
		
		// Set meeting chat tags
		const { setChatTypeTags } = get();
		setChatTypeTags([{ name: "meeting-chat", parent: "root" }]);
	},
	// Store selected meeting ID for meeting chat
	selectedMeetingId: null,
	setSelectedMeetingId: (meetingId) => set({ selectedMeetingId: meetingId }),
	// Store complete meeting workflow data (meeting type + instance)
	meetingWorkflowData: null,
	setMeetingWorkflowData: (data) => set({ meetingWorkflowData: data }),
	// Track if we're coming from MeetingChatFromMeetingInstance
	isFromMeetingInstance: false,
	setIsFromMeetingInstance: (value) => set({ isFromMeetingInstance: value }),
	// Reset function for new chats
	resetForNewChat: () => set({ 
		chatInput: "",
		chatContext: "",
		chatDirectiveType: "chat",
		chatTypeTags: [],
		selectedContexts: {},
		selectedMeetingId: null,
		meetingWorkflowData: null,
		isFromMeetingInstance: false,
	}),
}));


