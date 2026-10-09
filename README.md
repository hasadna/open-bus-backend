# 🚌 Open Bus Backend

A backend service powering the Open-Bus platform.
Provides APIs for health checks, GitHub issue creation, and complaint submission.

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

# Complaint email delivery
RESEND_API_KEY=your_resend_api_key
RESEND_COMPLAINT_FROM=complaints@your_verified_domain
RESEND_WEBHOOK_SECRET=whsec_your_signing_secret
RESEND_NOTIFICATION_FROM=notifications@your_verified_domain
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

Complaint bodies accept optional `data.lang`: `he`, `en`, `ru`, or `ar` (Hebrew when omitted). Unsupported values return `400`. Complaint emails always use Hebrew labels and include the user's preferred language; submitted titles and descriptions are preserved as written. Both complaint and delivery-failure emails include HTML and plain-text versions. Failure notifications use the preferred language stored in the complaint email's `lang` tag, with Hebrew as the fallback for older emails. Hebrew and Arabic notifications use right-to-left layouts.

- `POST /complaints/send` → Requires a `pair-key` UUID header and a complaint body with `data.email`. Queues the complaint in SQS, then submits an email to Resend from the verified `RESEND_COMPLAINT_FROM` address to `pniotcrm@mot.gov.il`, with the submitter as Reply-To. Returns `SENT` (200), `PROCESSING` (202), or `FAILED` (502). A Resend failure is also copied to `complaints-dlq`. SQS queue and dead-letter queue are created when needed. AWS region and credentials use the SDK's standard configuration. The AWS identity needs `sqs:CreateQueue`, `sqs:GetQueueAttributes`, and `sqs:SendMessage` permissions. Duplicate status is cached in each server process for up to 24 hours or 1000 entries. Provider idempotency keys hash the same normalized UUID and email identity as the cache. SQS messages remain as an audit backlog; no worker consumes them in this phase.

Server will be available at: [http://localhost:3001](http://localhost:3001)

Configure a Resend webhook to send `email.failed`, `email.bounced`, and `email.suppressed` events to `POST /complaints/webhook` on your public server URL. Copy its signing secret into `RESEND_WEBHOOK_SECRET`. Set `RESEND_NOTIFICATION_FROM` to a sender on your verified Resend domain. After signature verification, failure events tagged `purpose=complaint` retrieve the sent email and notify its stored Reply-To address (`data.email` when submitting). The Resend API key must allow reading and sending emails. Other events, including notification failures, are acknowledged without sending email. Notifications use the complaint email ID as an idempotency key. Invalid signatures receive `400`; missing configuration receives `503`; email lookup or notification sending failures receive `502` so Resend can retry. Events do not update complaint status yet.
