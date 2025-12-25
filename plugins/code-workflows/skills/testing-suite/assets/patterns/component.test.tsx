/**
 * Component Testing Pattern
 * Uses Vitest + Testing Library
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../vitest/test-utils";

// Example component to test
interface ButtonProps {
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
	loading?: boolean;
}

function Button({ onClick, children, disabled, loading }: ButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled || loading}
			aria-busy={loading}
		>
			{loading ? "Loading..." : children}
		</button>
	);
}

// Tests
describe("Button", () => {
	const mockOnClick = vi.fn();

	beforeEach(() => {
		mockOnClick.mockClear();
	});

	it("renders children correctly", () => {
		render(<Button onClick={mockOnClick}>Click me</Button>);

		expect(screen.getByRole("button")).toHaveTextContent("Click me");
	});

	it("calls onClick when clicked", async () => {
		const { user } = render(<Button onClick={mockOnClick}>Click me</Button>);

		await user.click(screen.getByRole("button"));

		expect(mockOnClick).toHaveBeenCalledTimes(1);
	});

	it("does not call onClick when disabled", async () => {
		const { user } = render(
			<Button onClick={mockOnClick} disabled>
				Click me
			</Button>,
		);

		await user.click(screen.getByRole("button"));

		expect(mockOnClick).not.toHaveBeenCalled();
	});

	it("shows loading state", () => {
		render(
			<Button onClick={mockOnClick} loading>
				Submit
			</Button>,
		);

		expect(screen.getByRole("button")).toHaveTextContent("Loading...");
		expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
	});

	it("is disabled while loading", async () => {
		const { user } = render(
			<Button onClick={mockOnClick} loading>
				Submit
			</Button>,
		);

		await user.click(screen.getByRole("button"));

		expect(mockOnClick).not.toHaveBeenCalled();
	});

	// Snapshot test
	it("matches snapshot", () => {
		const { container } = render(
			<Button onClick={mockOnClick}>Snapshot Test</Button>,
		);

		expect(container).toMatchSnapshot();
	});
});

// Form component example
interface FormProps {
	onSubmit: (data: { email: string; password: string }) => void;
}

function LoginForm({ onSubmit }: FormProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				const formData = new FormData(e.currentTarget);
				onSubmit({
					email: formData.get("email") as string,
					password: formData.get("password") as string,
				});
			}}
		>
			<label>
				Email
				<input type="email" name="email" required />
			</label>
			<label>
				Password
				<input type="password" name="password" required />
			</label>
			<button type="submit">Sign in</button>
		</form>
	);
}

describe("LoginForm", () => {
	const mockOnSubmit = vi.fn();

	beforeEach(() => {
		mockOnSubmit.mockClear();
	});

	it("renders all form fields", () => {
		render(<LoginForm onSubmit={mockOnSubmit} />);

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
	});

	it("submits form with entered data", async () => {
		const { user } = render(<LoginForm onSubmit={mockOnSubmit} />);

		await user.type(screen.getByLabelText(/email/i), "test@example.com");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(mockOnSubmit).toHaveBeenCalledWith({
			email: "test@example.com",
			password: "password123",
		});
	});

	it("validates required fields", async () => {
		const { user } = render(<LoginForm onSubmit={mockOnSubmit} />);

		await user.click(screen.getByRole("button", { name: /sign in/i }));

		// Form should not submit without required fields
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});
});

// Async component example
interface AsyncComponentProps {
	loadData: () => Promise<string[]>;
}

function AsyncList({ loadData }: AsyncComponentProps) {
	const [items, setItems] = React.useState<string[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		loadData()
			.then(setItems)
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [loadData]);

	if (loading) return <div role="progressbar">Loading...</div>;
	if (error) return <div role="alert">{error}</div>;

	return (
		<ul>
			{items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
}

import React from "react";

describe("AsyncList", () => {
	it("shows loading state initially", () => {
		const loadData = vi.fn(() => new Promise(() => {})); // Never resolves

		render(<AsyncList loadData={loadData} />);

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("renders items after loading", async () => {
		const loadData = vi.fn(() => Promise.resolve(["Item 1", "Item 2", "Item 3"]));

		render(<AsyncList loadData={loadData} />);

		await waitFor(() => {
			expect(screen.getByText("Item 1")).toBeInTheDocument();
		});

		expect(screen.getByText("Item 2")).toBeInTheDocument();
		expect(screen.getByText("Item 3")).toBeInTheDocument();
	});

	it("shows error message on failure", async () => {
		const loadData = vi.fn(() => Promise.reject(new Error("Failed to load")));

		render(<AsyncList loadData={loadData} />);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("Failed to load");
		});
	});
});
