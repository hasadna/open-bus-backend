# 🚌 Open Bus Backend

A backend service powering the Open-Bus platform.
Provides APIs for health checks, GitHub issue creation, complaints, and government transportation data.

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
npm start
```

## 🧪 Testing

```bash
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
  -e LOG_LEVEL=info \
  open-bus-backend
```

## 🔗 API Endpoints

### 🩺 Health Check

- `GET /` → Returns server status

### 🐞 GitHub Issues

- `POST /issues` → Create a new GitHub issue
  - **Required:** `title`, `contactName`, `contactEmail`, `description`, `environment`, `expectedBehavior`, `actualBehavior`, `reproducibility`
  - **Optional:** `attachments[]` (array of URLs), `debugContext` (URL/context of the page the report was filed from)

### 📣 Complaints

- `POST /complaints` → Submit a complaint to government forms
  - **Required:**
    - `userData`: `firstName`, `lastName`, `id`, `email`, `phone`
    - `databusData`: `operator`

  - **Optional:** `debug`, `complaintType`, `description`

### 🏛️ Government Transportation

| Endpoint                | Method | Required Body                                           |
| ----------------------- | ------ | ------------------------------------------------------- |
| `/gov/lines-by-station` | POST   | `EventDate`, `OperatorId`, `StationId`                  |
| `/gov/stations-by-line` | POST   | `eventDate`, `OperatorId`, `OfficelineId`, `Directions` |
| `/gov/subjects`         | POST   | `listName = "subject_type_vehicles"`                    |
| `/gov/train-stations`   | POST   | `StationTypeId`                                         |
| `/gov/pniya`            | POST   | `listName = "pniya"`                                    |
| `/gov/not-real-numbers` | POST   | `listName = "notrealnumbers"`                           |
| `/gov/lines-by-line`    | POST   | `eventDate`, `OperatorId`, `OperatorLineId`             |
| `/gov/cities`           | POST   | none                                                    |
| `/gov/time`             | GET    | none                                                    |

Server will be available at: [http://localhost:3001](http://localhost:3001)
