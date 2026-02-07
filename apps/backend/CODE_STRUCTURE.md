# Backend Code Structure

This project follows **Clean Architecture** principles with explicit **Dependency Inversion**. The goal is to keep the business logic (domain) isolated from external concerns like databases, frameworks, and third-party SDKs.

## Directory Structure

### `src/features/` (The Core Domain)
Contains all business policy and domain logic. Each subdirectory represents a specific feature (e.g., `auth`, `users`).
- `*.controller.ts`: HTTP adapters (request parsing/response formatting only).
- `*.service.ts`: Business rules and orchestration.
- `*.entity.ts`: Framework-agnostic domain models.
- `*.dto.ts`: Data transfer objects/contracts.
- `*.repository.ts`: **Interfaces only**. Defines how the domain wants to access data.

### `src/core/` (Framework Concerns)
Shared technical concerns that cut across multiple features.
- `ports/`: Shared technical interfaces (e.g., `ITokenService`).
- `middleware/`: Express middleware (auth, error handling, logging).
- `routes/`: Route composition only.

### `src/lib/` (External Mechanisms)
Implementations for technical capabilities (Adapters).
- Examples: `jwt/`, `crypto/`, `smtp/`, `twilio/`.
- Implements ports defined in `core/ports`.
- **Constraint**: Must NOT contain business rules.

### `src/lib/persistence/` (Infrastructure)
Concrete implementations for data access.
- Prisma usage is strictly isolated here.
- Implements repository interfaces defined in `features/`.

### `src/container/` (Composition Root)
The "brain" that wires everything together.
- Instantiates PrismaClient, lib services, and repositories.
- Performs Dependency Injection.
- **Constraint**: No business logic allowed.

---

## Architectural Rules (Non-Negotiable)

1.  **Dependency Rule**: Dependencies only point inwards. Domain (`features`) must never know about implementation details (`lib`, `persistence`, `Prisma`).
2.  **No Direct Imports**: Features must never import from `lib/` or `persistence/` directly. They depend on interfaces (ports/repositories).
3.  **Isolated Prisma**: PrismaClient is instantiated only in the `container` and used only in the `persistence` layer. Prisma types should not leak into the domain.
4.  **No Singletons**: Avoid global singletons. Use DI via the container to ensure testability.
5.  **Union Types over Enums**: Prefer TypeScript union types for better flexibility and standard compliance.
6.  **Fail Fast**: Use Zod for strict validation at the entry points (controllers).

## Workflow for New Features
1. Define the **Domain Entity** and **DTOs**.
2. Define the **Repository Interface** in the feature folder.
3. Implement the **Business Logic** in a Service.
4. Create a **Controller** to handle HTTP requests.
5. Implement the **Repository Implementation** in `persistence/prisma`.
6. Wire the new components in `src/container/index.ts`.
7. Add the routes in `src/core/routes`.
