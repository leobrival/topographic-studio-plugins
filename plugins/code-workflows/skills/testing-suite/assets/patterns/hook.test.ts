/**
 * Hook Testing Pattern
 * Uses Vitest + Testing Library renderHook
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createWrapper } from "../vitest/test-utils";

// Example hooks to test

// Simple state hook
function useCounter(initialValue = 0) {
	const [count, setCount] = useState(initialValue);

	const increment = useCallback(() => setCount((c) => c + 1), []);
	const decrement = useCallback(() => setCount((c) => c - 1), []);
	const reset = useCallback(() => setCount(initialValue), [initialValue]);

	return { count, increment, decrement, reset };
}

describe("useCounter", () => {
	it("initializes with default value", () => {
		const { result } = renderHook(() => useCounter());

		expect(result.current.count).toBe(0);
	});

	it("initializes with custom value", () => {
		const { result } = renderHook(() => useCounter(10));

		expect(result.current.count).toBe(10);
	});

	it("increments count", () => {
		const { result } = renderHook(() => useCounter());

		act(() => {
			result.current.increment();
		});

		expect(result.current.count).toBe(1);
	});

	it("decrements count", () => {
		const { result } = renderHook(() => useCounter(5));

		act(() => {
			result.current.decrement();
		});

		expect(result.current.count).toBe(4);
	});

	it("resets to initial value", () => {
		const { result } = renderHook(() => useCounter(10));

		act(() => {
			result.current.increment();
			result.current.increment();
		});

		expect(result.current.count).toBe(12);

		act(() => {
			result.current.reset();
		});

		expect(result.current.count).toBe(10);
	});
});

// Async data fetching hook
function useAsyncData<T>(fetchFn: () => Promise<T>) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchFn();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [fetchFn]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, loading, error, refetch };
}

describe("useAsyncData", () => {
	it("starts in loading state", () => {
		const fetchFn = vi.fn(() => new Promise(() => {})); // Never resolves

		const { result } = renderHook(() => useAsyncData(fetchFn));

		expect(result.current.loading).toBe(true);
		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it("resolves with data", async () => {
		const mockData = { id: 1, name: "Test" };
		const fetchFn = vi.fn(() => Promise.resolve(mockData));

		const { result } = renderHook(() => useAsyncData(fetchFn));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual(mockData);
		expect(result.current.error).toBeNull();
	});

	it("handles errors", async () => {
		const fetchFn = vi.fn(() => Promise.reject(new Error("Fetch failed")));

		const { result } = renderHook(() => useAsyncData(fetchFn));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error?.message).toBe("Fetch failed");
	});

	it("refetches data", async () => {
		let callCount = 0;
		const fetchFn = vi.fn(() => Promise.resolve({ count: ++callCount }));

		const { result } = renderHook(() => useAsyncData(fetchFn));

		await waitFor(() => {
			expect(result.current.data).toEqual({ count: 1 });
		});

		await act(async () => {
			await result.current.refetch();
		});

		expect(result.current.data).toEqual({ count: 2 });
	});
});

// Local storage hook
function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch {
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;
				setStoredValue(valueToStore);
				if (typeof window !== "undefined") {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				}
			} catch (error) {
				console.error(error);
			}
		},
		[key, storedValue],
	);

	const removeValue = useCallback(() => {
		try {
			setStoredValue(initialValue);
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(key);
			}
		} catch (error) {
			console.error(error);
		}
	}, [key, initialValue]);

	return [storedValue, setValue, removeValue] as const;
}

describe("useLocalStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns initial value when storage is empty", () => {
		const { result } = renderHook(() => useLocalStorage("test", "default"));

		expect(result.current[0]).toBe("default");
	});

	it("reads existing value from storage", () => {
		localStorage.setItem("test", JSON.stringify("stored-value"));

		const { result } = renderHook(() => useLocalStorage("test", "default"));

		expect(result.current[0]).toBe("stored-value");
	});

	it("saves value to storage", () => {
		const { result } = renderHook(() => useLocalStorage("test", "default"));

		act(() => {
			result.current[1]("new-value");
		});

		expect(result.current[0]).toBe("new-value");
		expect(JSON.parse(localStorage.getItem("test") || "")).toBe("new-value");
	});

	it("removes value from storage", () => {
		const { result } = renderHook(() => useLocalStorage("test", "default"));

		act(() => {
			result.current[1]("new-value");
		});

		expect(result.current[0]).toBe("new-value");

		act(() => {
			result.current[2]();
		});

		expect(result.current[0]).toBe("default");
		expect(localStorage.getItem("test")).toBeNull();
	});

	it("handles objects", () => {
		const { result } = renderHook(() =>
			useLocalStorage("user", { name: "", age: 0 }),
		);

		act(() => {
			result.current[1]({ name: "John", age: 30 });
		});

		expect(result.current[0]).toEqual({ name: "John", age: 30 });
	});
});

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

describe("useDebounce", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("initial", 500));

		expect(result.current).toBe("initial");
	});

	it("debounces value changes", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 500),
			{ initialProps: { value: "initial" } },
		);

		expect(result.current).toBe("initial");

		rerender({ value: "updated" });

		// Should still be initial immediately
		expect(result.current).toBe("initial");

		// Fast forward time
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Now should be updated
		expect(result.current).toBe("updated");
	});

	it("cancels pending updates on rapid changes", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 500),
			{ initialProps: { value: "initial" } },
		);

		rerender({ value: "first" });

		act(() => {
			vi.advanceTimersByTime(200);
		});

		rerender({ value: "second" });

		act(() => {
			vi.advanceTimersByTime(200);
		});

		// Should still be initial because timer resets
		expect(result.current).toBe("initial");

		rerender({ value: "final" });

		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should be the final value
		expect(result.current).toBe("final");
	});
});

// Hook with provider dependency
function useQueryWrapper() {
	// This would typically use TanStack Query
	return { isReady: true };
}

describe("useQueryWrapper", () => {
	it("works with query client provider", () => {
		const { result } = renderHook(() => useQueryWrapper(), {
			wrapper: createWrapper(),
		});

		expect(result.current.isReady).toBe(true);
	});
});
