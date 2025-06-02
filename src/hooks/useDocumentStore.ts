import { create } from "zustand";
import { GetFolderSubFolderProp } from "@/api/folderRoutes";
import { StorageResourceEntity } from "@/types/document";

// Current folder structure for navigation
export interface CurrentFolderStructure {
	folderId: string;
	folderName: string;
	depth: number;
	parent: CurrentFolderStructure | null;
}

// Cached folder data
export interface FolderData {
	id: string;
	name: string;
	created_at: string;
	parent_id: string;
	type_of: string;
	subFolders?: GetFolderSubFolderProp[];
	files?: StorageResourceEntity[];
	isLoaded: boolean;
	lastFetched?: Date;
}

export interface DocumentStore {
	// Project context
	activeProjectId: string | null;
	isProjectWide: boolean;
	setProjectContext: (projectId: string, isProjectWide: boolean) => void;
	
	// Root folder
	rootId: string | null;
	setRootId: (rootId: string, rootName: string) => void;
	
	// Current navigation
	currentFolderStructure: CurrentFolderStructure | null;
	setCurrentFolderStructure: (structure: CurrentFolderStructure | null) => void;
	navigateToFolder: (folderId: string, folderName: string) => void;
	navigateBack: () => void;
	
	// Folder hierarchy cache
	folders: { [folderId: string]: FolderData };
	setFolderData: (folderId: string, data: Partial<FolderData>) => void;
	setSubFolders: (folderId: string, subFolders: GetFolderSubFolderProp[]) => void;
	setFiles: (folderId: string, files: StorageResourceEntity[]) => void;
	
	// Loading states
	loadingFolders: Set<string>;
	loadingFiles: Set<string>;
	setFolderLoading: (folderId: string, loading: boolean) => void;
	setFilesLoading: (folderId: string, loading: boolean) => void;
	
	// CRUD operations that sync with cache
	addFolder: (parentFolderId: string, folder: GetFolderSubFolderProp) => void;
	removeFolder: (folderId: string, parentFolderId?: string) => void;
	addFile: (folderId: string, file: StorageResourceEntity) => void;
	removeFile: (folderId: string, fileId: string) => void;
	
	// Cache management
	invalidateFolder: (folderId: string) => void;
	clearCache: () => void;
	reset: () => void;
	
	// Utility methods
	getFolderById: (folderId: string) => FolderData | undefined;
	getFilesForFolder: (folderId: string) => StorageResourceEntity[] | undefined;
	getSubFoldersForFolder: (folderId: string) => GetFolderSubFolderProp[] | undefined;
	isFolderLoaded: (folderId: string) => boolean;
}

const initialState = {
	activeProjectId: null,
	isProjectWide: true,
	rootId: null,
	currentFolderStructure: null,
	folders: {},
	loadingFolders: new Set<string>(),
	loadingFiles: new Set<string>(),
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
	...initialState,
	
	setProjectContext: (projectId, isProjectWide) => {
		const state = get();
		if (state.activeProjectId !== projectId || state.isProjectWide !== isProjectWide) {
			// Clear cache when switching projects or contexts
			set({
				activeProjectId: projectId,
				isProjectWide: isProjectWide,
				folders: {},
				currentFolderStructure: null,
				rootId: null,
				loadingFolders: new Set(),
				loadingFiles: new Set(),
			});
		}
	},
	
	setRootId: (rootId, rootName) => {
		const { isProjectWide } = get();
		set({
			rootId,
			currentFolderStructure: {
				folderId: rootId,
				folderName: isProjectWide ? "Project Database" : "Personal Database",
				depth: 0,
				parent: null,
			},
		});
	},
	
	setCurrentFolderStructure: (structure) => set({ currentFolderStructure: structure }),
	
	navigateToFolder: (folderId, folderName) => {
		const { currentFolderStructure } = get();
		const newStructure: CurrentFolderStructure = {
			folderId,
			folderName,
			depth: currentFolderStructure ? currentFolderStructure.depth + 1 : 0,
			parent: currentFolderStructure,
		};
		set({ currentFolderStructure: newStructure });
	},
	
	navigateBack: () => {
		const { currentFolderStructure } = get();
		if (currentFolderStructure?.parent) {
			set({ currentFolderStructure: currentFolderStructure.parent });
		}
	},
	
	setFolderData: (folderId, data) => set((state) => ({
		folders: {
			...state.folders,
			[folderId]: {
				...state.folders[folderId],
				...data,
				id: folderId,
				lastFetched: new Date(),
			},
		},
	})),
	
	setSubFolders: (folderId, subFolders) => set((state) => ({
		folders: {
			...state.folders,
			[folderId]: {
				...state.folders[folderId],
				id: folderId,
				subFolders,
				isLoaded: true,
				lastFetched: new Date(),
			},
		},
	})),
	
	setFiles: (folderId, files) => set((state) => ({
		folders: {
			...state.folders,
			[folderId]: {
				...state.folders[folderId],
				id: folderId,
				files,
				isLoaded: true,
				lastFetched: new Date(),
			},
		},
	})),
	
	setFolderLoading: (folderId, loading) => set((state) => {
		const newLoadingFolders = new Set(state.loadingFolders);
		if (loading) {
			newLoadingFolders.add(folderId);
		} else {
			newLoadingFolders.delete(folderId);
		}
		return { loadingFolders: newLoadingFolders };
	}),
	
	setFilesLoading: (folderId, loading) => set((state) => {
		const newLoadingFiles = new Set(state.loadingFiles);
		if (loading) {
			newLoadingFiles.add(folderId);
		} else {
			newLoadingFiles.delete(folderId);
		}
		return { loadingFiles: newLoadingFiles };
	}),
	
	addFolder: (parentFolderId, folder) => set((state) => {
		const parentFolder = state.folders[parentFolderId];
		if (!parentFolder) return state;
		
		const updatedParentFolder = {
			...parentFolder,
			subFolders: [...(parentFolder.subFolders || []), folder],
		};
		
		return {
			folders: {
				...state.folders,
				[parentFolderId]: updatedParentFolder,
			},
		};
	}),
	
	removeFolder: (folderId, parentFolderId) => set((state) => {
		const newFolders = { ...state.folders };
		
		// Remove the folder itself
		delete newFolders[folderId];
		
		// Remove from parent's subFolders if parentFolderId is provided
		if (parentFolderId && newFolders[parentFolderId]) {
			const parentFolder = newFolders[parentFolderId];
			newFolders[parentFolderId] = {
				...parentFolder,
				subFolders: parentFolder.subFolders?.filter((f) => f.id !== folderId) || [],
			};
		}
		
		return { folders: newFolders };
	}),
	
	addFile: (folderId, file) => set((state) => {
		const folder = state.folders[folderId];
		if (!folder) return state;
		
		const updatedFolder = {
			...folder,
			files: [...(folder.files || []), file],
		};
		
		return {
			folders: {
				...state.folders,
				[folderId]: updatedFolder,
			},
		};
	}),
	
	removeFile: (folderId, fileId) => set((state) => {
		const folder = state.folders[folderId];
		if (!folder) return state;
		
		const updatedFolder = {
			...folder,
			files: folder.files?.filter((f) => f.id !== fileId) || [],
		};
		
		return {
			folders: {
				...state.folders,
				[folderId]: updatedFolder,
			},
		};
	}),
	
	invalidateFolder: (folderId) => set((state) => {
		const folder = state.folders[folderId];
		if (!folder) return state;
		
		return {
			folders: {
				...state.folders,
				[folderId]: {
					...folder,
					isLoaded: false,
					subFolders: undefined,
					files: undefined,
				},
			},
		};
	}),
	
	clearCache: () => set({
		folders: {},
		loadingFolders: new Set(),
		loadingFiles: new Set(),
	}),
	
	reset: () => set(initialState),
	
	// Utility methods
	getFolderById: (folderId) => {
		const { folders } = get();
		return folders[folderId];
	},
	
	getFilesForFolder: (folderId) => {
		const { folders } = get();
		return folders[folderId]?.files;
	},
	
	getSubFoldersForFolder: (folderId) => {
		const { folders } = get();
		return folders[folderId]?.subFolders;
	},
	
	isFolderLoaded: (folderId) => {
		const { folders } = get();
		return folders[folderId]?.isLoaded || false;
	},
})); 