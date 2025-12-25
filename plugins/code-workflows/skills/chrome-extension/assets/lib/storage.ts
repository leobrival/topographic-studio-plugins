/**
 * Chrome Storage Wrapper
 * Type-safe wrapper for chrome.storage API with sync and local support
 */

type StorageArea = "sync" | "local" | "session";

interface StorageOptions {
	area?: StorageArea;
}

// Storage schema - define your storage types here
interface StorageSchema {
	settings: {
		enabled: boolean;
		apiKey: string;
		notifications: boolean;
		theme: "light" | "dark" | "system";
	};
	userData: {
		id: string;
		email: string;
		name: string;
		preferences: Record<string, unknown>;
	};
	cache: {
		lastSync: number;
		data: Record<string, unknown>;
	};
	history: Array<{
		url: string;
		title: string;
		timestamp: number;
	}>;
}

// Type-safe storage keys
type StorageKey = keyof StorageSchema;

/**
 * Get a value from storage
 */
async function get<K extends StorageKey>(
	key: K,
	options: StorageOptions = {},
): Promise<StorageSchema[K] | null> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve) => {
		storage.get(key, (result) => {
			resolve(result[key] ?? null);
		});
	});
}

/**
 * Get multiple values from storage
 */
async function getMany<K extends StorageKey>(
	keys: K[],
	options: StorageOptions = {},
): Promise<Partial<Pick<StorageSchema, K>>> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve) => {
		storage.get(keys, (result) => {
			resolve(result as Partial<Pick<StorageSchema, K>>);
		});
	});
}

/**
 * Get all values from storage
 */
async function getAll(
	options: StorageOptions = {},
): Promise<Partial<StorageSchema>> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve) => {
		storage.get(null, (result) => {
			resolve(result as Partial<StorageSchema>);
		});
	});
}

/**
 * Set a value in storage
 */
async function set<K extends StorageKey>(
	key: K,
	value: StorageSchema[K],
	options: StorageOptions = {},
): Promise<void> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve, reject) => {
		storage.set({ [key]: value }, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

/**
 * Set multiple values in storage
 */
async function setMany(
	items: Partial<StorageSchema>,
	options: StorageOptions = {},
): Promise<void> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve, reject) => {
		storage.set(items, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

/**
 * Remove a value from storage
 */
async function remove<K extends StorageKey>(
	key: K,
	options: StorageOptions = {},
): Promise<void> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve, reject) => {
		storage.remove(key, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

/**
 * Remove multiple values from storage
 */
async function removeMany<K extends StorageKey>(
	keys: K[],
	options: StorageOptions = {},
): Promise<void> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve, reject) => {
		storage.remove(keys, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

/**
 * Clear all storage
 */
async function clear(options: StorageOptions = {}): Promise<void> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve, reject) => {
		storage.clear(() => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

/**
 * Watch for storage changes
 */
function watch<K extends StorageKey>(
	key: K,
	callback: (
		newValue: StorageSchema[K] | undefined,
		oldValue: StorageSchema[K] | undefined,
	) => void,
	options: StorageOptions = {},
): () => void {
	const { area = "local" } = options;

	const listener = (
		changes: { [key: string]: chrome.storage.StorageChange },
		areaName: string,
	) => {
		if (areaName === area && key in changes) {
			const change = changes[key];
			callback(
				change.newValue as StorageSchema[K] | undefined,
				change.oldValue as StorageSchema[K] | undefined,
			);
		}
	};

	chrome.storage.onChanged.addListener(listener);

	// Return unsubscribe function
	return () => {
		chrome.storage.onChanged.removeListener(listener);
	};
}

/**
 * Watch all storage changes
 */
function watchAll(
	callback: (
		changes: Partial<{
			[K in StorageKey]: {
				newValue?: StorageSchema[K];
				oldValue?: StorageSchema[K];
			};
		}>,
	) => void,
	options: StorageOptions = {},
): () => void {
	const { area = "local" } = options;

	const listener = (
		changes: { [key: string]: chrome.storage.StorageChange },
		areaName: string,
	) => {
		if (areaName === area) {
			callback(
				changes as Partial<{
					[K in StorageKey]: {
						newValue?: StorageSchema[K];
						oldValue?: StorageSchema[K];
					};
				}>,
			);
		}
	};

	chrome.storage.onChanged.addListener(listener);

	return () => {
		chrome.storage.onChanged.removeListener(listener);
	};
}

/**
 * Get storage usage info
 */
async function getUsage(options: StorageOptions = {}): Promise<{
	bytesInUse: number;
	quota: number;
	percentUsed: number;
}> {
	const { area = "local" } = options;
	const storage = chrome.storage[area];

	return new Promise((resolve) => {
		storage.getBytesInUse(null, (bytesInUse) => {
			// Quota varies by storage area
			const quota =
				area === "sync"
					? chrome.storage.sync.QUOTA_BYTES
					: chrome.storage.local.QUOTA_BYTES;

			resolve({
				bytesInUse,
				quota,
				percentUsed: (bytesInUse / quota) * 100,
			});
		});
	});
}

// Export storage API
export const storage = {
	get,
	getMany,
	getAll,
	set,
	setMany,
	remove,
	removeMany,
	clear,
	watch,
	watchAll,
	getUsage,
};

// Export types
export type { StorageSchema, StorageKey, StorageArea, StorageOptions };
