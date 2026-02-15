# Contributing to IRON Project

Thank you for your interest in contributing to the IRON Project!

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pandianss/iron-x.git
    cd iron-x/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to `.env` and configure your database connection.
    ```bash
    cp .env.example .env
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

## Development Workflow

-   **Branching:** Create a new branch for each feature or bugfix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
-   **Commits:** Use descriptive commit messages.
-   **Tests:** Ensure all tests pass before submitting a PR.
    ```bash
    npm test
    npm run test:e2e
    ```

## Coding Standards

-   Use TypeScript.
-   Follow the existing code style (enforced by `.editorconfig` and future ESLint rules).
-   Avoid `any` types.

## Pull Requests

1.  Push your branch to GitHub.
2.  Open a Pull Request against the `main` branch.
3.  Describe your changes and link any relevant issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
