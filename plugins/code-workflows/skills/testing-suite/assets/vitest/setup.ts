import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock window.matchMedia
beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
});

// Mock IntersectionObserver
beforeAll(() => {
	const mockIntersectionObserver = vi.fn();
	mockIntersectionObserver.mockReturnValue({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	});
	window.IntersectionObserver = mockIntersectionObserver;
});

// Mock ResizeObserver
beforeAll(() => {
	const mockResizeObserver = vi.fn();
	mockResizeObserver.mockReturnValue({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	});
	window.ResizeObserver = mockResizeObserver;
});

// Mock scrollTo
beforeAll(() => {
	window.scrollTo = vi.fn();
});

// Mock fetch (optional - uncomment if needed)
// beforeAll(() => {
//   global.fetch = vi.fn();
// });

// Suppress console errors in tests (optional)
// beforeAll(() => {
//   vi.spyOn(console, 'error').mockImplementation(() => {});
// });

// Custom matchers can be added here
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () =>
//         `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });
