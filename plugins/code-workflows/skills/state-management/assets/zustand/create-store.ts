import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

/**
 * Factory function to create a Zustand store with common middleware
 *
 * Features:
 * - DevTools integration
 * - Persistence (optional)
 * - Immer for immutable updates
 * - Subscribe with selector
 */
export function createStore<T extends object>(
	name: string,
	initializer: (
		set: (fn: (state: T) => void) => void,
		get: () => T,
	) => T,
	options?: {
		persist?: boolean;
		persistKey?: string;
		partialize?: (state: T) => Partial<T>;
	},
) {
	const store = immer(
		subscribeWithSelector((set, get) =>
			initializer(
				(fn) => set((state) => fn(state)),
				get,
			),
		),
	);

	if (options?.persist) {
		return create<T>()(
			devtools(
				persist(store, {
					name: options.persistKey || `${name}-storage`,
					partialize: options.partialize,
				}),
				{ name },
			),
		);
	}

	return create<T>()(devtools(store, { name }));
}

// Example usage:
// const useCounterStore = createStore(
//   'Counter',
//   (set, get) => ({
//     count: 0,
//     increment: () => set((state) => { state.count += 1 }),
//     decrement: () => set((state) => { state.count -= 1 }),
//     getDoubled: () => get().count * 2,
//   }),
//   { persist: true }
// );

/**
 * Create a simple slice for combining stores
 */
export function createSlice<T extends object>(
	initialState: T,
	actions: (
		set: (fn: (state: T) => void) => void,
		get: () => T,
	) => Record<string, (...args: unknown[]) => void>,
) {
	return (
		set: (fn: (state: T) => void) => void,
		get: () => T,
	) => ({
		...initialState,
		...actions(set, get),
	});
}

// Example combining slices:
// const useStore = create(
//   devtools(
//     immer((...args) => ({
//       ...createUserSlice(...args),
//       ...createCartSlice(...args),
//     }))
//   )
// );

/**
 * Reset store helper
 */
export function createResettableStore<T extends object>(
	name: string,
	initialState: T,
	actions: (
		set: (fn: (state: T) => void) => void,
		get: () => T,
	) => Record<string, (...args: unknown[]) => void>,
) {
	return create<T & { reset: () => void }>()(
		devtools(
			immer((set, get) => ({
				...initialState,
				...actions(
					(fn) => set((state) => fn(state)),
					get,
				),
				reset: () =>
					set((state) => {
						Object.assign(state, initialState);
					}),
			})),
			{ name },
		),
	);
}

/**
 * Type-safe selector creator
 */
export function createSelector<T, R>(
	selector: (state: T) => R,
): (state: T) => R {
	return selector;
}

/**
 * Shallow comparison for arrays/objects
 */
export { shallow } from "zustand/shallow";

// Example with shallow:
// const { users, posts } = useStore(
//   (state) => ({ users: state.users, posts: state.posts }),
//   shallow
// );
