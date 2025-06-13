import { create } from "zustand";

interface SidePanel {
	id: string;
	isOpen: boolean;
	type: "sources" | "editor" | "pdfViewer" | "log" | "folder";
	resourceId: string;
	filename?: string;
	title?: string;
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
	addTab: (tab: Omit<SidePanel, "id">) => void;
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
	chatDirectiveType: "chat" | "bidLevelling" | "dailyReport" | "reportWriting" | "knowledgeManager" | "none";
	setChatDirectiveType: (directiveType: "chat" | "bidLevelling" | "dailyReport" | "reportWriting" | "knowledgeManager" | "none") => void;
}

const generateTabId = () => `tab_${Date.now()}_${Math.random().toString(36)
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
		const { tabs, addTab } = get();
		addTab(sidePanel);
	},
	tabs: [],
	activeTabId: null,
	isWaitingForResponse: false,
	setIsWaitingForResponse: (isWaitingForResponse) => set({ isWaitingForResponse }),
	addTab: (tab) => set((state) => {
		const tabId = generateTabId();
		const newTab = {
			...tab,
			id: tabId,
			title: tab.title || tab.filename || `${tab.type} ${tab.resourceId.slice(0, 8)}`,
		};
		
		// Check if a tab with the same resourceId and type already exists
		const existingTab = state.tabs.find(
			(t) => t.resourceId === tab.resourceId && t.type === tab.type,
		);
		
		if (existingTab) {
			// If it exists, just make it active
			return {
				activeTabId: existingTab.id,
			};
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

		const { ["untitled"]: _, ...restContexts } = state.selectedContexts;
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
	chatDirectiveType: "chat",
	setChatDirectiveType: (directiveType) => set({ chatDirectiveType: directiveType }),
}));


