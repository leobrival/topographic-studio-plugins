# React Hook Form Patterns

## Installation

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

## Basic Form

```tsx
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email", { required: "Email is required" })}
        type="email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register("password", { required: "Password is required" })}
        type="password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

## Zod Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

## Form State

```tsx
const {
  formState: {
    errors,           // Validation errors
    isSubmitting,     // Form is submitting
    isValid,          // Form is valid
    isDirty,          // Form has been modified
    dirtyFields,      // Which fields are dirty
    touchedFields,    // Which fields have been touched
    submitCount,      // Number of submit attempts
    isSubmitSuccessful, // Last submit was successful
  },
} = useForm();
```

## Validation Modes

```tsx
const form = useForm({
  mode: "onBlur",        // Validate on blur
  // mode: "onChange",   // Validate on change
  // mode: "onSubmit",   // Validate on submit only
  // mode: "onTouched",  // Validate on blur, then change
  // mode: "all",        // Validate on blur and change
});
```

## Default Values

```tsx
const form = useForm({
  defaultValues: {
    email: "",
    name: "",
    settings: {
      notifications: true,
    },
  },
});

// Or async default values
const form = useForm({
  defaultValues: async () => {
    const user = await fetchUser();
    return {
      email: user.email,
      name: user.name,
    };
  },
});
```

## Watch Values

```tsx
const { watch, register } = useForm();

// Watch single field
const email = watch("email");

// Watch multiple fields
const [email, password] = watch(["email", "password"]);

// Watch all fields
const allValues = watch();

// Watch with callback (outside render)
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(name, type, value);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

## Controlled Components

```tsx
import { useController, useForm } from "react-hook-form";

function ControlledInput({ name, control }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div>
      <input {...field} />
      {error && <span>{error.message}</span>}
    </div>
  );
}

// Or with Controller component
import { Controller } from "react-hook-form";

<Controller
  name="select"
  control={control}
  render={({ field }) => (
    <Select {...field} options={options} />
  )}
/>
```

## Field Arrays

```tsx
import { useFieldArray, useForm } from "react-hook-form";

function DynamicForm() {
  const { control, register } = useForm({
    defaultValues: {
      items: [{ name: "" }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "" })}>
        Add Item
      </button>
    </form>
  );
}
```

## Form Actions

```tsx
const { setValue, getValues, reset, trigger, setError, clearErrors } = useForm();

// Set value programmatically
setValue("email", "new@example.com");
setValue("user.name", "John", { shouldValidate: true });

// Get values
const email = getValues("email");
const allValues = getValues();

// Reset form
reset(); // Reset to default values
reset({ email: "", name: "" }); // Reset to specific values

// Trigger validation
await trigger(); // Validate all
await trigger("email"); // Validate single field
await trigger(["email", "password"]); // Validate multiple

// Manual errors
setError("email", { type: "manual", message: "Email already exists" });
setError("root", { message: "Form submission failed" });

// Clear errors
clearErrors("email");
clearErrors(); // Clear all
```

## Server Actions (Next.js)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { createUser } from "@/actions/users";

function Form() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await createUser(data);
    if (result.error) {
      setError("root", { message: result.error });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {/* fields */}
      {formState.errors.root && (
        <div className="error">{formState.errors.root.message}</div>
      )}
    </form>
  );
}
```

## Form with TanStack Query

```tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
  const queryClient = useQueryClient();
  const form = useForm<CreateUserInput>();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      {/* fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

## Common Zod Patterns

```typescript
import { z } from "zod";

// Email
z.string().email()

// Password with requirements
z.string()
  .min(8)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")

// Optional with transform
z.string().optional().transform((val) => val || undefined)

// Enum
z.enum(["user", "admin", "moderator"])

// Date
z.coerce.date()

// Number from string
z.coerce.number().positive()

// URL
z.string().url()

// UUID
z.string().uuid()

// Trim whitespace
z.string().trim()

// Conditional validation
z.object({
  type: z.enum(["email", "phone"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "email") return !!data.email;
    if (data.type === "phone") return !!data.phone;
    return true;
  },
  { message: "Provide contact method" }
);
```
