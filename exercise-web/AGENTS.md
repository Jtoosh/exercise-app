# Exercise Web App - Agent Documentation

- The purpose of this app is for personal use to conveniently generate workouts.
- Scalability is not a huge concern, though general good software engineering should be adhered to.

## Core principles

When coding, follow these core principles:

- Simplicity
- High Cohesion, Low Coupling
- Readability
- Testability
- DRY Principle
- Manage complexity (YAGNI)

## Rules

The core principles extend into these ground rules:

- Only add as much complexity as is currently necessary. Don't add complexity in anticipation of a future extension.
- Keep code modular using inheritance and polymorphism.
- Use descriptive but concise variable name (avoid things like `f`, `i`, `num`, `ex`, etc.)
- Use dependency injection to make components easily testable.
- Use composition and delegation to avoid duplicate code
- If an answer or fix is unknown, say you don't know (don't make something up).

## Practices
- Keep commits shorter and more frequent.
- Keep PRs manageably sized. Utilize GitHub Stacked PRs to manage complexity of large PRs.
- Use conventional commits standards for commit messages.

## Approved Documentation

Use official tool documentation and reputable sources  such as :
- Bun docs
- React docs
- Typescript docs
- etc.

Do not consult forums like Reddit, Stack Overflow, or other for architecture and design decisions. If these sources are needed for troubleshooting, ask permission first.
Any unapproved or uncertain sources should not be consulted without explicit approval.