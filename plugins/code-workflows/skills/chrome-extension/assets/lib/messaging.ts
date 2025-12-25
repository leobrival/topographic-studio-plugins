/**
 * Chrome Extension Messaging Utilities
 * Type-safe message passing between extension components
 */

// Message types - define your message schema here
interface MessageSchema {
	// Background script messages
	PROCESS_PAGE: { tabId: number };
	GET_SETTINGS: void;
	UPDATE_BADGE: { text: string; color?: string };
	SHOW_NOTIFICATION: { title: string; message: string };

	// Content script messages
	GET_PAGE_DATA: void;
	SHOW_RESULT: { result: unknown };
	QUICK_ACTION: void;
	HIGHLIGHT_TEXT: { selector: string; color: string };

	// Popup messages
	TOGGLE_FEATURE: { enabled: boolean };
	SAVE_SETTINGS: { settings: Record<string, unknown> };
}

// Response types for each message
interface ResponseSchema {
	PROCESS_PAGE: { success: boolean; data?: unknown };
	GET_SETTINGS: { enabled: boolean; apiKey: string } | null;
	UPDATE_BADGE: { success: boolean };
	SHOW_NOTIFICATION: { success: boolean };
	GET_PAGE_DATA: {
		url: string;
		title: string;
		content: string;
	};
	SHOW_RESULT: { success: boolean };
	QUICK_ACTION: { success: boolean };
	HIGHLIGHT_TEXT: { success: boolean };
	TOGGLE_FEATURE: { success: boolean };
	SAVE_SETTINGS: { success: boolean };
}

type MessageType = keyof MessageSchema;

interface Message<T extends MessageType = MessageType> {
	type: T;
	payload: MessageSchema[T];
}

type MessageHandler<T extends MessageType> = (
	message: Message<T>,
	sender: chrome.runtime.MessageSender,
) => Promise<ResponseSchema[T]> | ResponseSchema[T];

/**
 * Send message to background script
 */
async function sendMessage<T extends MessageType>(
	type: T,
	payload?: MessageSchema[T],
): Promise<ResponseSchema[T]> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type, payload }, (response) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(response);
			}
		});
	});
}

/**
 * Send message to a specific tab's content script
 */
async function sendToTab<T extends MessageType>(
	tabId: number,
	type: T,
	payload?: MessageSchema[T],
): Promise<ResponseSchema[T]> {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tabId, { type, payload }, (response) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(response);
			}
		});
	});
}

/**
 * Send message to all tabs matching a query
 */
async function sendToAllTabs<T extends MessageType>(
	query: chrome.tabs.QueryInfo,
	type: T,
	payload?: MessageSchema[T],
): Promise<Array<{ tabId: number; response: ResponseSchema[T] | null }>> {
	const tabs = await chrome.tabs.query(query);

	const results = await Promise.allSettled(
		tabs.map(async (tab) => {
			if (!tab.id) return { tabId: -1, response: null };
			try {
				const response = await sendToTab(tab.id, type, payload);
				return { tabId: tab.id, response };
			} catch {
				return { tabId: tab.id, response: null };
			}
		}),
	);

	return results
		.filter(
			(r): r is PromiseFulfilledResult<{ tabId: number; response: ResponseSchema[T] | null }> =>
				r.status === "fulfilled",
		)
		.map((r) => r.value);
}

/**
 * Listen for messages (use in background or content scripts)
 */
function onMessage<T extends MessageType>(
	handler: (
		message: Message<T>,
		sender: chrome.runtime.MessageSender,
	) => Promise<ResponseSchema[T] | { success: boolean; error: string }>,
): void {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		// Handle async responses
		handler(message as Message<T>, sender)
			.then(sendResponse)
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});

		// Return true to indicate async response
		return true;
	});
}

/**
 * Create a typed message handler map
 */
function createMessageHandlers<T extends Partial<{ [K in MessageType]: MessageHandler<K> }>>(
	handlers: T,
): (
	message: Message,
	sender: chrome.runtime.MessageSender,
) => Promise<ResponseSchema[MessageType] | { success: boolean; error: string }> {
	return async (message, sender) => {
		const handler = handlers[message.type as keyof T];
		if (handler) {
			return handler(message as never, sender);
		}
		return { success: false, error: "Unknown message type" };
	};
}

/**
 * Port-based long-lived connections
 */
interface Port {
	name: string;
	port: chrome.runtime.Port;
	onMessage: <T extends MessageType>(
		callback: (message: Message<T>) => void,
	) => void;
	onDisconnect: (callback: () => void) => void;
	postMessage: <T extends MessageType>(
		type: T,
		payload?: MessageSchema[T],
	) => void;
	disconnect: () => void;
}

/**
 * Connect to background script with long-lived connection
 */
function connect(name: string): Port {
	const port = chrome.runtime.connect({ name });

	return {
		name,
		port,
		onMessage: (callback) => {
			port.onMessage.addListener(callback);
		},
		onDisconnect: (callback) => {
			port.onDisconnect.addListener(callback);
		},
		postMessage: (type, payload) => {
			port.postMessage({ type, payload });
		},
		disconnect: () => {
			port.disconnect();
		},
	};
}

/**
 * Listen for port connections (use in background script)
 */
function onConnect(callback: (port: Port) => void): void {
	chrome.runtime.onConnect.addListener((chromePort) => {
		const port: Port = {
			name: chromePort.name,
			port: chromePort,
			onMessage: (cb) => {
				chromePort.onMessage.addListener(cb);
			},
			onDisconnect: (cb) => {
				chromePort.onDisconnect.addListener(cb);
			},
			postMessage: (type, payload) => {
				chromePort.postMessage({ type, payload });
			},
			disconnect: () => {
				chromePort.disconnect();
			},
		};

		callback(port);
	});
}

/**
 * External messaging (from web pages or other extensions)
 */
function onExternalMessage(
	handler: (
		message: unknown,
		sender: chrome.runtime.MessageSender,
	) => Promise<unknown>,
): void {
	chrome.runtime.onMessageExternal.addListener(
		(message, sender, sendResponse) => {
			handler(message, sender)
				.then(sendResponse)
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			return true;
		},
	);
}

/**
 * Send message to another extension
 */
async function sendToExtension<R = unknown>(
	extensionId: string,
	message: unknown,
): Promise<R> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(extensionId, message, (response) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(response);
			}
		});
	});
}

// Export messaging API
export {
	sendMessage,
	sendToTab,
	sendToAllTabs,
	onMessage,
	createMessageHandlers,
	connect,
	onConnect,
	onExternalMessage,
	sendToExtension,
};

// Export types
export type {
	Message,
	MessageType,
	MessageSchema,
	ResponseSchema,
	MessageHandler,
	Port,
};
