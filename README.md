# Open Bus Backend

### Swagger UI

The API documentation is automatically generated and available at:

```
http://localhost:3001/docs
```

### API Endpoints

#### Health Check

- **GET** `/` - Health check endpoint
- Returns service status

#### GitHub Issues

- **POST** `/create-issue` - Create a new GitHub issue
- Requires: title, contactName, contactEmail, description, environment, expectedBehavior, actualBehavior, reproducibility
- Optional: attachments

#### Complaints

- **POST** `/complaint` - Submit a complaint to government forms
- Requires: userData (firstName, lastName, id, email, phone), databusData (operator)
- Optional: debug mode for testing

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3001
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run test:lint
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

The server will be accessible at `http://localhost:3001`.
