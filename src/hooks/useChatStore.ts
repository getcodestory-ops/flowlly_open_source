import { create } from "zustand";

interface ChatStore {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
    sidePanel: {
        isOpen: boolean;
        type: "sources" | "editor" | "pdfViewer";
        resourceId: string;
        filename?: string;
    } | null;
    setSidePanel: (sidePanel: {
        isOpen: boolean;
        type: "sources" | "editor" | "pdfViewer";
        resourceId: string;
        filename?: string;
    } | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
	collapsed: false,
	setCollapsed: (collapsed) => set({ collapsed }),
	sidePanel: {
		isOpen: false,
		type: "sources",
		resourceId: "",
		filename: "",
	},
	setSidePanel: (sidePanel) => set({ sidePanel }),
}));


