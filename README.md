# Open Bus Backend

## Configuration

Set the following environment variables:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

## Local Development

Install dependencies:

```bash
npm install
```

To start the server in development mode (with hot reload):

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

## Example: Creating an Issue

You can create a new issue by sending a POST request to the `/create-issue` endpoint. Here’s an example using `fetch`

```js
fetch('http://localhost:3001/create-issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Sample Title',
    contactName: 'John Doe',
    contactEmail: 'john.doe@example.com',
    description: 'Detailed description of the issue.',
    environment: 'Operating system, software version, hardware specifics.',
    expectedBehavior: 'What you expect to happen.',
    actualBehavior: 'What actually happens.',
    reproducibility: 'Steps to reproduce the issue.',
  }),
})
```

Replace the example values with your own details as needed.

## Testing

To run all tests:

```bash
npm test
```

To run lint checks:

```bash
npm run test:lint
```

To run Mocha tests:

```bash
npm run test:mocha
```

To generate a coverage report:

```bash
npm run test:coverage
```

## Running with Docker

To build and run the backend using Docker:

1. **Build the Docker image:**

```bash
docker build -t open-bus-backend .
```

2. **Run the container:**

```bash
docker run -it -p 3001:3001 \
  -e GITHUB_TOKEN=your_github_token \
  -e GITHUB_OWNER=your_github_owner \
  -e GITHUB_REPO=your_github_repo \
  open-bus-backend
```

Replace the environment variable values with your actual configuration.

The server will be accessible at [http://localhost:3001](http://localhost:3001).
