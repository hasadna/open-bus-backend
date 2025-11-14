# OpenCode Agents Configuration

## Build/Lint/Test Commands

```bash
# Install dependencies
npm ci

# Run all tests (lint + unit tests + coverage)
npm test

# Run unit tests only
npm run test:mocha

# Run single test file
npx mocha tests/specific.test.js

# Run linting (ESLint + Prettier check)
npm run test:lint

# Run with coverage
npm run test:coverage

# Fix linting issues
npm run lint:fix

# Start development server
npm run dev
```

## Code Style Guidelines

### Imports

- Use ES modules with named exports
- Import sorting handled by Prettier plugin
- Group imports: core libs, then local modules
- Use `.js` extensions in import paths

### Formatting

- Tab width: 2 spaces
- Single quotes for strings
- Trailing commas: all
- Print width: 150 characters
- Bracket same line: true

### Naming Conventions

- camelCase for variables, functions, methods
- PascalCase for classes (if any)
- UPPER_CASE for constants
- kebab-case for file names

### Error Handling

- Use try/catch blocks for async operations
- Log errors with request.log.error()
- Return appropriate HTTP status codes
- Provide meaningful error messages

### Code Structure

- JSDoc comments for exported functions
- Async/await for asynchronous code
- Destructure request.body, params, etc.
- Use Boolean() for truthy checks
- Consistent logging with request.log.info/error()</content>
  <parameter name="filePath">D:\WEB\open-bus-backend\AGENTS.md
