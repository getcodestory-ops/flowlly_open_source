import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
	hasHydrated: boolean;
	setHasHydrated: (hydrated: boolean) => void;
	getScopedFolderKey: (folderId: string) => string;

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
	updateFile: (folderId: string, fileId: string, updates: Partial<StorageResourceEntity>) => void;
	
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
	hasHydrated: false,
	activeProjectId: null,
	isProjectWide: true,
	rootId: null,
	currentFolderStructure: null,
	folders: {},
	loadingFolders: new Set<string>(),
	loadingFiles: new Set<string>(),
};

export const useDocumentStore = create<DocumentStore>()(
	persist(
		(set, get) => ({
	...initialState,

	getScopedFolderKey: (folderId: string) => {
		if (folderId.includes(":")) return folderId;
		const { activeProjectId, isProjectWide } = get();
		const projectKey = activeProjectId ?? "no-project";
		const scopeKey = isProjectWide ? "project" : "personal";
		return `${projectKey}:${scopeKey}:${folderId}`;
	},

	setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
	
	setProjectContext: (projectId, isProjectWide) => {
		const state = get();
		if (!state.hasHydrated) {
			// Avoid clearing pre-hydrated cache during initial mount race.
			set({
				activeProjectId: projectId,
				isProjectWide,
			});
			return;
		}
		if (state.activeProjectId !== projectId || state.isProjectWide !== isProjectWide) {
			// Reset navigation context when switching projects/scopes.
			// Keep folder cache entries; callers should use scoped keys.
			set({
				activeProjectId: projectId,
				isProjectWide: isProjectWide,
				currentFolderStructure: null,
				rootId: null,
				loadingFolders: new Set(),
				loadingFiles: new Set(),
			});
		}
	},
	
	setRootId: (rootId, rootName) => {
		const { isProjectWide, currentFolderStructure } = get();
		const rootLabel = isProjectWide ? "Project Database" : "Personal Database";
		set({
			rootId,
			// Do not clobber navigation history while browsing subfolders.
			currentFolderStructure: currentFolderStructure
				? (currentFolderStructure.folderId === "root"
					? { ...currentFolderStructure, folderName: rootLabel }
					: currentFolderStructure)
				: {
					// Keep a stable synthetic ID for UI/cache; API root requests use null.
					folderId: "root",
					folderName: rootLabel,
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
	
	setFolderData: (folderId, data) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: {
					...state.folders[resolvedFolderId],
					...data,
					id: resolvedFolderId,
					lastFetched: new Date(),
				},
			},
		};
	}),
	
	setSubFolders: (folderId, subFolders) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: {
					...state.folders[resolvedFolderId],
					id: resolvedFolderId,
					subFolders,
					isLoaded: true,
					lastFetched: new Date(),
				},
			},
		};
	}),
	
	setFiles: (folderId, files) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: {
					...state.folders[resolvedFolderId],
					id: resolvedFolderId,
					files,
					isLoaded: true,
					lastFetched: new Date(),
				},
			},
		};
	}),
	
	setFolderLoading: (folderId, loading) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const newLoadingFolders = new Set(state.loadingFolders);
		if (loading) {
			newLoadingFolders.add(resolvedFolderId);
		} else {
			newLoadingFolders.delete(resolvedFolderId);
		}
		return { loadingFolders: newLoadingFolders };
	}),
	
	setFilesLoading: (folderId, loading) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const newLoadingFiles = new Set(state.loadingFiles);
		if (loading) {
			newLoadingFiles.add(resolvedFolderId);
		} else {
			newLoadingFiles.delete(resolvedFolderId);
		}
		return { loadingFiles: newLoadingFiles };
	}),
	
	addFolder: (parentFolderId, folder) => set((state) => {
		const resolvedParentFolderId = state.getScopedFolderKey(parentFolderId);
		const parentFolder = state.folders[resolvedParentFolderId];
		if (!parentFolder) return state;
		
		const updatedParentFolder = {
			...parentFolder,
			subFolders: [...(parentFolder.subFolders || []), folder],
		};
		
		return {
			folders: {
				...state.folders,
				[resolvedParentFolderId]: updatedParentFolder,
			},
		};
	}),
	
	removeFolder: (folderId, parentFolderId) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const resolvedParentFolderId = parentFolderId
			? state.getScopedFolderKey(parentFolderId)
			: undefined;
		const newFolders = { ...state.folders };
		
		// Remove the folder itself
		delete newFolders[resolvedFolderId];
		
		// Remove from parent's subFolders if parentFolderId is provided
		if (resolvedParentFolderId && newFolders[resolvedParentFolderId]) {
			const parentFolder = newFolders[resolvedParentFolderId];
			newFolders[resolvedParentFolderId] = {
				...parentFolder,
				subFolders: parentFolder.subFolders?.filter((f) => f.id !== resolvedFolderId) || [],
			};
		}
		
		return { folders: newFolders };
	}),
	
	addFile: (folderId, file) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const folder = state.folders[resolvedFolderId];
		if (!folder) return state;
		
		const updatedFolder = {
			...folder,
			files: [...(folder.files || []), file],
		};
		
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: updatedFolder,
			},
		};
	}),
	
	removeFile: (folderId, fileId) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const folder = state.folders[resolvedFolderId];
		if (!folder) return state;
		
		const updatedFolder = {
			...folder,
			files: folder.files?.filter((f) => f.id !== fileId) || [],
		};
		
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: updatedFolder,
			},
		};
	}),
	
	updateFile: (folderId, fileId, updates) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const folder = state.folders[resolvedFolderId];
		if (!folder) return state;
		
		const updatedFolder = {
			...folder,
			files: folder.files?.map((f) => 
				f.id === fileId ? { ...f, ...updates } : f
			) || [],
		};
		
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: updatedFolder,
			},
		};
	}),
	
	invalidateFolder: (folderId) => set((state) => {
		const resolvedFolderId = state.getScopedFolderKey(folderId);
		const folder = state.folders[resolvedFolderId];
		if (!folder) return state;
		
		return {
			folders: {
				...state.folders,
				[resolvedFolderId]: {
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
		const { folders, getScopedFolderKey } = get();
		return folders[getScopedFolderKey(folderId)];
	},
	
	getFilesForFolder: (folderId) => {
		const { folders, getScopedFolderKey } = get();
		return folders[getScopedFolderKey(folderId)]?.files;
	},
	
	getSubFoldersForFolder: (folderId) => {
		const { folders, getScopedFolderKey } = get();
		return folders[getScopedFolderKey(folderId)]?.subFolders;
	},
	
	isFolderLoaded: (folderId) => {
		const { folders, getScopedFolderKey } = get();
		return folders[getScopedFolderKey(folderId)]?.isLoaded || false;
	},
}),
		{
			name: "flowlly-document-store",
			version: 2,
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
			migrate: (persistedState, version) => {
				if (version < 2 && persistedState && typeof persistedState === "object") {
					return {
						...(persistedState as Record<string, unknown>),
						folders: {},
					};
				}
				return persistedState as DocumentStore;
			},
			// Only persist the data cache — not transient states like loading sets or navigation
			partialize: (state) => ({
				folders: state.folders,
				activeProjectId: state.activeProjectId,
				isProjectWide: state.isProjectWide,
				rootId: state.rootId,
			}),
		},
	),
);