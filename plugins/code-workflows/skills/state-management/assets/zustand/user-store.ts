import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Types
interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

interface UserState {
	// State
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	setUser: (user: User) => void;
	updateUser: (updates: Partial<User>) => void;
	logout: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

// Store with all middleware
export const useUserStore = create<UserState>()(
	devtools(
		persist(
			subscribeWithSelector(
				immer((set) => ({
					// Initial state
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,

					// Actions
					setUser: (user) =>
						set((state) => {
							state.user = user;
							state.isAuthenticated = true;
							state.error = null;
						}),

					updateUser: (updates) =>
						set((state) => {
							if (state.user) {
								Object.assign(state.user, updates);
							}
						}),

					logout: () =>
						set((state) => {
							state.user = null;
							state.isAuthenticated = false;
						}),

					setLoading: (loading) =>
						set((state) => {
							state.isLoading = loading;
						}),

					setError: (error) =>
						set((state) => {
							state.error = error;
						}),
				})),
			),
			{
				name: "user-storage",
				partialize: (state) => ({
					user: state.user,
					isAuthenticated: state.isAuthenticated,
				}),
			},
		),
		{ name: "UserStore" },
	),
);

// Selectors (memoized)
export const selectUser = (state: UserState) => state.user;
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectIsLoading = (state: UserState) => state.isLoading;

// Usage in components:
// const user = useUserStore(selectUser);
// const { setUser, logout } = useUserStore();

// Subscribe to changes outside React
// useUserStore.subscribe(
//   (state) => state.isAuthenticated,
//   (isAuthenticated) => {
//     console.log('Auth changed:', isAuthenticated);
//   }
// );
