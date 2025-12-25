import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Types
interface Theme {
	mode: "light" | "dark" | "system";
	primaryColor: string;
}

interface Notification {
	id: string;
	type: "success" | "error" | "warning" | "info";
	title: string;
	message?: string;
	duration?: number;
}

interface Modal {
	id: string;
	component: string;
	props?: Record<string, unknown>;
}

interface AppState {
	// UI State
	theme: Theme;
	sidebarOpen: boolean;
	notifications: Notification[];
	modals: Modal[];

	// Actions - Theme
	setTheme: (theme: Partial<Theme>) => void;
	toggleDarkMode: () => void;

	// Actions - Sidebar
	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;

	// Actions - Notifications
	addNotification: (notification: Omit<Notification, "id">) => void;
	removeNotification: (id: string) => void;
	clearNotifications: () => void;

	// Actions - Modals
	openModal: (modal: Omit<Modal, "id">) => void;
	closeModal: (id: string) => void;
	closeAllModals: () => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				theme: {
					mode: "system",
					primaryColor: "#5469d4",
				},
				sidebarOpen: true,
				notifications: [],
				modals: [],

				// Theme actions
				setTheme: (theme) =>
					set((state) => ({
						theme: { ...state.theme, ...theme },
					})),

				toggleDarkMode: () =>
					set((state) => ({
						theme: {
							...state.theme,
							mode: state.theme.mode === "dark" ? "light" : "dark",
						},
					})),

				// Sidebar actions
				toggleSidebar: () =>
					set((state) => ({ sidebarOpen: !state.sidebarOpen })),

				setSidebarOpen: (open) => set({ sidebarOpen: open }),

				// Notification actions
				addNotification: (notification) => {
					const id = crypto.randomUUID();
					set((state) => ({
						notifications: [...state.notifications, { ...notification, id }],
					}));

					// Auto-remove after duration
					const duration = notification.duration ?? 5000;
					if (duration > 0) {
						setTimeout(() => {
							get().removeNotification(id);
						}, duration);
					}
				},

				removeNotification: (id) =>
					set((state) => ({
						notifications: state.notifications.filter((n) => n.id !== id),
					})),

				clearNotifications: () => set({ notifications: [] }),

				// Modal actions
				openModal: (modal) => {
					const id = crypto.randomUUID();
					set((state) => ({
						modals: [...state.modals, { ...modal, id }],
					}));
				},

				closeModal: (id) =>
					set((state) => ({
						modals: state.modals.filter((m) => m.id !== id),
					})),

				closeAllModals: () => set({ modals: [] }),
			}),
			{
				name: "app-storage",
				partialize: (state) => ({
					theme: state.theme,
					sidebarOpen: state.sidebarOpen,
				}),
			},
		),
		{ name: "AppStore" },
	),
);

// Selectors
export const selectTheme = (state: AppState) => state.theme;
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen;
export const selectNotifications = (state: AppState) => state.notifications;
export const selectModals = (state: AppState) => state.modals;
export const selectActiveModal = (state: AppState) =>
	state.modals[state.modals.length - 1];

// Utility hooks
export function useNotifications() {
	return useAppStore((state) => ({
		notifications: state.notifications,
		add: state.addNotification,
		remove: state.removeNotification,
		clear: state.clearNotifications,
	}));
}

export function useModals() {
	return useAppStore((state) => ({
		modals: state.modals,
		active: state.modals[state.modals.length - 1],
		open: state.openModal,
		close: state.closeModal,
		closeAll: state.closeAllModals,
	}));
}
