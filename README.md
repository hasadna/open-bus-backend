# Open Bus Backend

## Configuration

The following environment variables are required:

* GITHUB_TOKEN
* GITHUB_OWNER
* GITHUB_REPO

## Local Development

```
npm install
node index.js

curl -X POST http://localhost:3001/create-issue -H "Content-Type: application/json" -d '{
  "title": "Sample Title",
  "contactName": "John Doe",
  "contactEmail": "john.doe@example.com",
  "description": "Detailed description of the issue.",
  "environment": "Operating system, software version, hardware specifics.",
  "expectedBehavior": "What you expect to happen.",
  "actualBehavior": "What actually happens.",
  "reproducibility": "Steps to reproduce the issue."
}'
```

## Running with Docker

```
docker build -t backend .
docker run -it -p 3001:3001 -e GITHUB_TOKEN -e GITHUB_OWNER -e GITHUB_REPO backend
```

alternatively - run with docker-compose:
```
docker compose up --build --remove-orphans
```
