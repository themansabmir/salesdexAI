# Webapp Code Structure

The web application follows a **Feature-Oriented Modular Design**. This approach ensures that features are self-contained, easy to test, and highly decoupled.

## Directory Structure

### `src/app/` (Global Composition)
The entry point and global orchestration layer.
- `AppRouter.tsx`: Centralized routing configuration.
- `providers.tsx`: Global context providers (QueryClient, Toaster, etc.).
- `routes.config.ts`: Type-safe route definitions and navigation metadata.
- `layout/`: Shared layouts (e.g., `ProtectedLayout`, `DashboardLayout`).

### `src/features/` (Feature Modules)
Each subdirectory is a complete vertical slice of functionality (e.g., `auth`).
- `domain/`: Business types, interfaces, and **Zod schemas**.
- `application/`: State management and business orchestration logic.
    - Contains **independent, exportable TanStack Query hooks** (e.g., `useUser.ts`, `useLogin.ts`).
- `infrastructure/`: External communication (API functions).
    - Flattened functions that interact with the `apiClient`.
- `presentation/`: UI components.
    - `components/`: **"Dumb" components** (purely UI, no business logic, no hooks).
    - `pages/`: **"Smart" pages** (handles side effects, uses hooks, orchestrates components).

### `src/shared/` (The UI Foundation)
Global reusable resources.
- `ui/`: Highly reusable, atomic UI components (Shadcn/UI components like `button`, `input`, `card`).
- `lib/`: Shared utilities (e.g., `cn` for Tailwind merging).
- `hooks/`: Generic, non-business hooks (e.g., `use-debounce`).

### `src/lib/` (External Config)
Configuration for external libraries.
- `api-client.ts`: Axios instance with interceptors for token attachment and error handling.

---

## Technical Practices

### 1. State Management (TanStack Query)
- **Do not use React Context for server state**. Use TanStack Query's cache as the single source of truth.
- Define specific hooks in the `application/` layer for every API interaction.
- Use `queryClient.setQueryData` for manual cache updates (e.g., after login).

### 2. UI Component Philosophy
- **Separation of Concerns**: Presentation components must be "dumb". They receive data and callbacks via props only.
- **Styling**: Use utility-first CSS via **Tailwind CSS**.
- **Design System**: Strictly follow the Shadcn/UI patterns in `src/shared/ui`.

### 3. API Communication
- All API calls must go through the `apiClient` in `src/lib`.
- Attach required headers (like `Authorization`) via request interceptors.
- Centralize API endpoints in the `infrastructure/` folder of the relevant feature.

### 4. Validation
- Use **Zod** for both form validation (client-side) and API response validation.
- Schema definitions live in the feature's `domain/` folder to be reused by both components and hooks.

---

## File Naming Conventions
- `kebab-case.tsx` for components and pages.
- `kebab-case.ts` for non-UI logic (hooks, utils, schemas).
- Hooks must be prefixed with `use-` (e.g., `use-login.ts`).
