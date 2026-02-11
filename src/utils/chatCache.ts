import { AgentChat, AgentChatEntity } from "@/types/agentChats";

const DB_NAME = "flowlly-chat-cache";
const DB_VERSION = 1;
const CHAT_ENTITIES_STORE = "chat_entities";
const CHAT_HISTORY_STORE = "chat_history";

type CacheRecord<T> = {
	key: string;
	data: T;
	updatedAt: number;
};

const isBrowser = () => typeof window !== "undefined" && typeof indexedDB !== "undefined";

const openChatCacheDb = (): Promise<IDBDatabase | null> => {
	if (!isBrowser()) return Promise.resolve(null);

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(CHAT_ENTITIES_STORE)) {
				db.createObjectStore(CHAT_ENTITIES_STORE, { keyPath: "key" });
			}
			if (!db.objectStoreNames.contains(CHAT_HISTORY_STORE)) {
				db.createObjectStore(CHAT_HISTORY_STORE, { keyPath: "key" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
};

const getFromStore = async <T>(storeName: string, key: string): Promise<T | null> => {
	const db = await openChatCacheDb();
	if (!db) return null;

	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);
		const request = store.get(key);

		request.onsuccess = () => {
			const record = request.result as CacheRecord<T> | undefined;
			resolve(record?.data ?? null);
		};
		request.onerror = () => reject(request.error);
	});
};

const setInStore = async <T>(storeName: string, key: string, data: T): Promise<void> => {
	const db = await openChatCacheDb();
	if (!db) return;

	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);
		const record: CacheRecord<T> = {
			key,
			data,
			updatedAt: Date.now(),
		};
		store.put(record);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
};

const chatEntitiesKey = (projectId: string, relationId: string, relationType: string) =>
	`${projectId}:${relationType}:${relationId}`;

export const getCachedChatEntities = async(
	projectId: string,
	relationId: string,
	relationType: string,
): Promise<AgentChatEntity[] | null> => {
	return getFromStore<AgentChatEntity[]>(
		CHAT_ENTITIES_STORE,
		chatEntitiesKey(projectId, relationId, relationType),
	);
};

export const setCachedChatEntities = async(
	projectId: string,
	relationId: string,
	relationType: string,
	data: AgentChatEntity[],
): Promise<void> => {
	await setInStore(
		CHAT_ENTITIES_STORE,
		chatEntitiesKey(projectId, relationId, relationType),
		data,
	);
};

const chatHistoryKey = (chatEntityId: string) => chatEntityId;

export const getCachedChatHistory = async(chatEntityId: string): Promise<AgentChat[] | null> => {
	return getFromStore<AgentChat[]>(CHAT_HISTORY_STORE, chatHistoryKey(chatEntityId));
};

export const setCachedChatHistory = async(chatEntityId: string, data: AgentChat[]): Promise<void> => {
	await setInStore(CHAT_HISTORY_STORE, chatHistoryKey(chatEntityId), data);
};

