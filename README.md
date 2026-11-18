# 🚌 Open Bus Backend

A backend service powering the Open-Bus platform.
Provides the full 27-endpoint STRIDE transit API against an externally managed ClickHouse database, health checks, and GitHub issue creation. Complaint submission is planned for a future PR.

## 📢 Get Involved

- 💬 For general help and system updates, join the Hasadna Slack: [#open-bus channel](https://join.slack.com/t/hasadna/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig)
- 🐞 Found a bug or have a feature request? [Open an issue](https://github.com/hasadna/open-bus-map-search/issues/new)
- 🤝 Want to contribute? See our [contributing guidelines](https://github.com/hasadna/open-bus-pipelines/blob/main/CONTRIBUTING.md)

## 📖 API Documentation

- 📄 Swagger UI (production): [https://open-bus-backend.k8s.hasadna.org.il/docs](https://open-bus-backend.k8s.hasadna.org.il/docs)
- 🖥️ Swagger UI (local): [http://localhost:3001/docs](http://localhost:3001/docs)

## 🔗 Related Projects

- [🗺️ Open Bus Map Search (Client App)](https://github.com/hasadna/open-bus-map-search) - [Live Website](https://open-bus-map-search.hasadna.org.il/dashboard)
- [📦 NPM Package](https://www.npmjs.com/package/@hasadna/open-bus-api-client)

## ⚙️ Installation

```bash
npm install
```

## 🌍 Environment Variables

Create a `.env` file:

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# External ClickHouse (required)
CLICKHOUSE_URL=https://your-clickhouse-host:8443
CLICKHOUSE_USER=api_reader
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DB=stride

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
```

## 🚀 Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Check TypeScript types
npm run typecheck

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run lint checks
npm run test:lint

# Fix lint issues
npm run lint:fix
```

## 🐳 Running with Docker

1. **Build the image**

```bash
docker build -t open-bus-backend .
```

2. **Run the container**

```bash
docker run -it -p 3001:3001 \
  -e GITHUB_TOKEN=your_github_token \
  -e GITHUB_OWNER=your_github_owner \
  -e GITHUB_REPO=your_github_repo \
  -e CLICKHOUSE_URL=https://your-clickhouse-host:8443 \
  -e CLICKHOUSE_USER=api_reader \
  -e CLICKHOUSE_PASSWORD=your-password \
  -e CLICKHOUSE_DB=stride \
  -e LOG_LEVEL=info \
  open-bus-backend
```

## 🔗 API Endpoints

### 🩺 Health Check

- `GET /` → Returns server status

### 🐞 GitHub Issues

- `POST /issues` → Create a new GitHub issue
  - **Required:** `title`, `contactName`, `description`, `environment`, `expectedBehavior`, `actualBehavior`, `reproducibility`
  - **Optional:** `contactEmail`, `publishContactEmail` (boolean, default `false`; the email is posted in the public issue only when `true`), `attachments[]` (array of URLs), `debugContext` (URL/context of the page the report was filed from)

### 📣 Complaints

- `POST /complaints/send` → Returns `501 Not Implemented` until complaint submission is added.

Server will be available at: [http://localhost:3001](http://localhost:3001)

## Transit API and database ownership

All 27 STRIDE transit endpoints retain their original paths, including SIRI and GTFS list/get routes, route timetables, stop arrivals, ride execution, velocity aggregation, and GTFS ride aggregates. See `/docs` for the combined documentation and `/openapi.json` for the contract.

This repository connects directly to an external ClickHouse database compatible with the pinned stride-lite schema. It does not provision a database, manage migrations, or ingest data. See [connection and compatibility requirements](src/db/README.md) and [upstream attribution](src/stride/README.md).
