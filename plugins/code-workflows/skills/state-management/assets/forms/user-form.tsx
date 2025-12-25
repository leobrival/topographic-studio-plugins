"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation schema
const userSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Invalid email address"),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		),
	confirmPassword: z.string(),
	role: z.enum(["user", "admin", "moderator"]),
	bio: z.string().max(500).optional(),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	notifications: z.object({
		email: z.boolean(),
		push: z.boolean(),
		sms: z.boolean(),
	}),
	terms: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
	onSubmit: (data: UserFormData) => Promise<void>;
	defaultValues?: Partial<UserFormData>;
	isEdit?: boolean;
}

export function UserForm({
	onSubmit,
	defaultValues,
	isEdit = false,
}: UserFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting, isDirty, isValid },
	} = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			confirmPassword: "",
			role: "user",
			bio: "",
			website: "",
			notifications: {
				email: true,
				push: false,
				sms: false,
			},
			terms: false,
			...defaultValues,
		},
		mode: "onChange", // Validate on change
	});

	const watchRole = watch("role");

	const handleFormSubmit = async (data: UserFormData) => {
		try {
			await onSubmit(data);
			if (!isEdit) {
				reset(); // Reset form after successful creation
			}
		} catch (error) {
			console.error("Form submission failed:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
			{/* Email Field */}
			<div>
				<label htmlFor="email" className="block text-sm font-medium">
					Email
				</label>
				<input
					id="email"
					type="email"
					{...register("email")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					aria-invalid={errors.email ? "true" : "false"}
				/>
				{errors.email && (
					<p className="mt-1 text-sm text-red-600" role="alert">
						{errors.email.message}
					</p>
				)}
			</div>

			{/* Name Field */}
			<div>
				<label htmlFor="name" className="block text-sm font-medium">
					Name
				</label>
				<input
					id="name"
					type="text"
					{...register("name")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					aria-invalid={errors.name ? "true" : "false"}
				/>
				{errors.name && (
					<p className="mt-1 text-sm text-red-600" role="alert">
						{errors.name.message}
					</p>
				)}
			</div>

			{/* Password Fields */}
			{!isEdit && (
				<>
					<div>
						<label htmlFor="password" className="block text-sm font-medium">
							Password
						</label>
						<input
							id="password"
							type="password"
							{...register("password")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							aria-invalid={errors.password ? "true" : "false"}
						/>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600" role="alert">
								{errors.password.message}
							</p>
						)}
					</div>

					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium">
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							{...register("confirmPassword")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							aria-invalid={errors.confirmPassword ? "true" : "false"}
						/>
						{errors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600" role="alert">
								{errors.confirmPassword.message}
							</p>
						)}
					</div>
				</>
			)}

			{/* Role Select */}
			<div>
				<label htmlFor="role" className="block text-sm font-medium">
					Role
				</label>
				<select
					id="role"
					{...register("role")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				>
					<option value="user">User</option>
					<option value="admin">Admin</option>
					<option value="moderator">Moderator</option>
				</select>
				{watchRole === "admin" && (
					<p className="mt-1 text-sm text-yellow-600">
						Admin role requires additional approval.
					</p>
				)}
			</div>

			{/* Bio Textarea */}
			<div>
				<label htmlFor="bio" className="block text-sm font-medium">
					Bio (optional)
				</label>
				<textarea
					id="bio"
					{...register("bio")}
					rows={4}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
				{errors.bio && (
					<p className="mt-1 text-sm text-red-600" role="alert">
						{errors.bio.message}
					</p>
				)}
			</div>

			{/* Notification Checkboxes */}
			<fieldset>
				<legend className="text-sm font-medium">Notifications</legend>
				<div className="mt-2 space-y-2">
					<label className="flex items-center">
						<input
							type="checkbox"
							{...register("notifications.email")}
							className="rounded border-gray-300"
						/>
						<span className="ml-2 text-sm">Email notifications</span>
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							{...register("notifications.push")}
							className="rounded border-gray-300"
						/>
						<span className="ml-2 text-sm">Push notifications</span>
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							{...register("notifications.sms")}
							className="rounded border-gray-300"
						/>
						<span className="ml-2 text-sm">SMS notifications</span>
					</label>
				</div>
			</fieldset>

			{/* Terms Checkbox */}
			<div>
				<label className="flex items-center">
					<input
						type="checkbox"
						{...register("terms")}
						className="rounded border-gray-300"
					/>
					<span className="ml-2 text-sm">
						I accept the{" "}
						<a href="/terms" className="text-blue-600 underline">
							terms and conditions
						</a>
					</span>
				</label>
				{errors.terms && (
					<p className="mt-1 text-sm text-red-600" role="alert">
						{errors.terms.message}
					</p>
				)}
			</div>

			{/* Submit Button */}
			<div className="flex gap-4">
				<button
					type="submit"
					disabled={isSubmitting || !isValid}
					className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{isSubmitting ? "Submitting..." : isEdit ? "Update" : "Create"}
				</button>
				<button
					type="button"
					onClick={() => reset()}
					disabled={!isDirty}
					className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
				>
					Reset
				</button>
			</div>
		</form>
	);
}
