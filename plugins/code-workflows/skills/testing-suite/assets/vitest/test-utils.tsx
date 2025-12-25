import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Custom providers wrapper
interface AllProvidersProps {
	children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

// Custom render function
function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: AllProviders, ...options }),
	};
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
export { userEvent };

// Utility functions
export function createWrapper(): React.FC<{ children: ReactNode }> {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
}

// Mock factories
export function createMockUser(overrides = {}) {
	return {
		id: "user-1",
		email: "test@example.com",
		name: "Test User",
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

export function createMockPost(overrides = {}) {
	return {
		id: "post-1",
		title: "Test Post",
		content: "Test content",
		authorId: "user-1",
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

// Wait utilities
export async function waitForLoadingToFinish() {
	const { waitFor, screen } = await import("@testing-library/react");
	await waitFor(
		() => {
			const loaders = screen.queryAllByRole("progressbar");
			expect(loaders).toHaveLength(0);
		},
		{ timeout: 4000 },
	);
}

// Mock response helpers
export function createMockResponse<T>(data: T, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => data,
		text: async () => JSON.stringify(data),
	};
}

export function createMockErrorResponse(message: string, status = 500) {
	return {
		ok: false,
		status,
		json: async () => ({ error: message }),
		text: async () => message,
	};
}
