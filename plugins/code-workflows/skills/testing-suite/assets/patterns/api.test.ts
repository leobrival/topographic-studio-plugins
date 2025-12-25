/**
 * API/Integration Testing Pattern
 * Uses Vitest + MSW for API mocking
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// API client to test
const API_BASE = "https://api.example.com";

interface User {
	id: string;
	email: string;
	name: string;
}

interface CreateUserInput {
	email: string;
	name: string;
}

async function fetchUsers(): Promise<User[]> {
	const response = await fetch(`${API_BASE}/users`);
	if (!response.ok) throw new Error("Failed to fetch users");
	return response.json();
}

async function fetchUser(id: string): Promise<User> {
	const response = await fetch(`${API_BASE}/users/${id}`);
	if (!response.ok) throw new Error("User not found");
	return response.json();
}

async function createUser(data: CreateUserInput): Promise<User> {
	const response = await fetch(`${API_BASE}/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error("Failed to create user");
	return response.json();
}

async function updateUser(
	id: string,
	data: Partial<CreateUserInput>,
): Promise<User> {
	const response = await fetch(`${API_BASE}/users/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error("Failed to update user");
	return response.json();
}

async function deleteUser(id: string): Promise<void> {
	const response = await fetch(`${API_BASE}/users/${id}`, {
		method: "DELETE",
	});
	if (!response.ok) throw new Error("Failed to delete user");
}

// Mock data
const mockUsers: User[] = [
	{ id: "1", email: "john@example.com", name: "John Doe" },
	{ id: "2", email: "jane@example.com", name: "Jane Doe" },
];

// MSW handlers
const handlers = [
	// GET /users
	http.get(`${API_BASE}/users`, () => {
		return HttpResponse.json(mockUsers);
	}),

	// GET /users/:id
	http.get(`${API_BASE}/users/:id`, ({ params }) => {
		const user = mockUsers.find((u) => u.id === params.id);
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(user);
	}),

	// POST /users
	http.post(`${API_BASE}/users`, async ({ request }) => {
		const data = (await request.json()) as CreateUserInput;
		const newUser: User = {
			id: String(Date.now()),
			...data,
		};
		return HttpResponse.json(newUser, { status: 201 });
	}),

	// PATCH /users/:id
	http.patch(`${API_BASE}/users/:id`, async ({ params, request }) => {
		const user = mockUsers.find((u) => u.id === params.id);
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		const data = (await request.json()) as Partial<CreateUserInput>;
		const updatedUser = { ...user, ...data };
		return HttpResponse.json(updatedUser);
	}),

	// DELETE /users/:id
	http.delete(`${API_BASE}/users/:id`, ({ params }) => {
		const user = mockUsers.find((u) => u.id === params.id);
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		return new HttpResponse(null, { status: 204 });
	}),
];

// Setup MSW server
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Tests
describe("Users API", () => {
	describe("fetchUsers", () => {
		it("returns list of users", async () => {
			const users = await fetchUsers();

			expect(users).toHaveLength(2);
			expect(users[0]).toEqual({
				id: "1",
				email: "john@example.com",
				name: "John Doe",
			});
		});

		it("handles server error", async () => {
			server.use(
				http.get(`${API_BASE}/users`, () => {
					return new HttpResponse(null, { status: 500 });
				}),
			);

			await expect(fetchUsers()).rejects.toThrow("Failed to fetch users");
		});

		it("handles network error", async () => {
			server.use(
				http.get(`${API_BASE}/users`, () => {
					return HttpResponse.error();
				}),
			);

			await expect(fetchUsers()).rejects.toThrow();
		});
	});

	describe("fetchUser", () => {
		it("returns user by id", async () => {
			const user = await fetchUser("1");

			expect(user).toEqual({
				id: "1",
				email: "john@example.com",
				name: "John Doe",
			});
		});

		it("throws error for non-existent user", async () => {
			await expect(fetchUser("999")).rejects.toThrow("User not found");
		});
	});

	describe("createUser", () => {
		it("creates new user", async () => {
			const newUser = await createUser({
				email: "new@example.com",
				name: "New User",
			});

			expect(newUser).toMatchObject({
				email: "new@example.com",
				name: "New User",
			});
			expect(newUser.id).toBeDefined();
		});

		it("handles validation error", async () => {
			server.use(
				http.post(`${API_BASE}/users`, () => {
					return HttpResponse.json(
						{ error: "Email already exists" },
						{ status: 400 },
					);
				}),
			);

			await expect(
				createUser({ email: "john@example.com", name: "John" }),
			).rejects.toThrow("Failed to create user");
		});
	});

	describe("updateUser", () => {
		it("updates existing user", async () => {
			const updatedUser = await updateUser("1", { name: "John Updated" });

			expect(updatedUser.name).toBe("John Updated");
			expect(updatedUser.email).toBe("john@example.com");
		});

		it("throws error for non-existent user", async () => {
			await expect(updateUser("999", { name: "Test" })).rejects.toThrow(
				"Failed to update user",
			);
		});
	});

	describe("deleteUser", () => {
		it("deletes existing user", async () => {
			await expect(deleteUser("1")).resolves.toBeUndefined();
		});

		it("throws error for non-existent user", async () => {
			await expect(deleteUser("999")).rejects.toThrow("Failed to delete user");
		});
	});
});

// Testing with request verification
describe("API Request Verification", () => {
	it("sends correct headers", async () => {
		let capturedHeaders: Headers | null = null;

		server.use(
			http.post(`${API_BASE}/users`, async ({ request }) => {
				capturedHeaders = request.headers;
				return HttpResponse.json({ id: "1", email: "test@example.com", name: "Test" });
			}),
		);

		await createUser({ email: "test@example.com", name: "Test" });

		expect(capturedHeaders?.get("content-type")).toBe("application/json");
	});

	it("sends correct request body", async () => {
		let capturedBody: CreateUserInput | null = null;

		server.use(
			http.post(`${API_BASE}/users`, async ({ request }) => {
				capturedBody = (await request.json()) as CreateUserInput;
				return HttpResponse.json({ id: "1", ...capturedBody });
			}),
		);

		await createUser({ email: "test@example.com", name: "Test User" });

		expect(capturedBody).toEqual({
			email: "test@example.com",
			name: "Test User",
		});
	});
});

// Testing with delays
describe("API with delays", () => {
	it("handles slow responses", async () => {
		server.use(
			http.get(`${API_BASE}/users`, async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return HttpResponse.json(mockUsers);
			}),
		);

		const start = Date.now();
		const users = await fetchUsers();
		const duration = Date.now() - start;

		expect(users).toHaveLength(2);
		expect(duration).toBeGreaterThanOrEqual(100);
	});
});

// Testing authenticated requests
describe("Authenticated API", () => {
	async function fetchWithAuth(url: string, token: string) {
		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (response.status === 401) throw new Error("Unauthorized");
		return response.json();
	}

	it("sends authorization header", async () => {
		let receivedToken: string | null = null;

		server.use(
			http.get(`${API_BASE}/users`, ({ request }) => {
				receivedToken = request.headers.get("authorization");
				return HttpResponse.json(mockUsers);
			}),
		);

		await fetchWithAuth(`${API_BASE}/users`, "test-token");

		expect(receivedToken).toBe("Bearer test-token");
	});

	it("handles unauthorized error", async () => {
		server.use(
			http.get(`${API_BASE}/users`, () => {
				return new HttpResponse(null, { status: 401 });
			}),
		);

		await expect(
			fetchWithAuth(`${API_BASE}/users`, "invalid-token"),
		).rejects.toThrow("Unauthorized");
	});
});
