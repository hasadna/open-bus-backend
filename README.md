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
AWS_REGION=us-east-1
# For local development; deployments can use an IAM role instead.
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SES_EMAIL=open_bus@your_verified_domain
SES_COMPLAINTS_EMAIL=complaints@domain
# Optional
# SES_CONFIGURATION_SET=complaints
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

Populate `.env` with your AWS and GitHub configuration, then pass it to the container at runtime:

```bash
docker run -it -p 3001:3001 \
  --env-file .env \
  -e NODE_ENV=production \
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

Complaint data requires `firstName`, `lastName`, `email`, `mobile`, `eventHour`, `eventDate`, `details`, `title`, `transport`, and `subject`. `passport` is limited to 10 characters. Exactly one of `passport` or `id` must be non-empty. The unused identity may be omitted, null, or empty. Email is always required. If `bus` is provided, `bus.lineNumberText`, `bus.operator`, `bus.direction`, and `bus.raisingStation` are required. The line number must be non-empty, and each of the other three fields must contain a non-empty `dataText` and `dataCode`. `transport` and `subject` use `{ dataText, dataCode }` objects. `fromHour` and `toHour` are optional. Exactly one of `bus` or `train` is required. `details` is limited to 400 characters. Times use `HH:mm`; `eventDate` uses an ISO date-time. If `train` is provided, `trainType`, `startStation`, `destinationStation`, and `eventStation` are required; both stations must contain a non-empty `dataText` and `dataCode`. Train details accept `trainType` (`"1"` Israel Railways, `"2"` Jerusalem light rail, `"3"` Dankal), `startStation`, `destinationStation`, `eventStation` (`"start"` or `"destination"`), and `trainNumber`. Station fields use `{ dataText, dataCode }` objects. The former `requestSubject` and `taxi` fields are no longer part of the schema.

Complaint bodies accept optional `data.lang`: `he`, `en`, `ru`, or `ar` (Hebrew when omitted). Unsupported values return `400`. Complaint emails always use Hebrew labels and include the user's preferred language; submitted titles and descriptions are preserved as written. Both complaint and delivery-failure emails include HTML and plain-text versions. Failure notifications use the preferred language stored in the queued complaint, with Hebrew as the default. Hebrew and Arabic notifications use right-to-left layouts.

- `POST /complaints/send` ? Requires a `pair-key` UUID header and a validated complaint body. Enqueues the complaint in SQS and returns `202 { success: true, state: "PROCESSING", messageId }` once SQS accepts it. Returns `503` if enqueueing fails. The HTTP handler never calls SES. This replaces the synchronous `200 SENT` / `502 FAILED` delivery responses; there is no delivery-status endpoint.

Duplicate submissions share the enqueue result and return the same acceptance for up to one hour or 1,000 cached entries per server process. Identity uses the normalized UUID, email, and debug flag. Enqueue failures clear the cached attempt so callers can retry. This cache does not survive restarts or span server instances.

Server will be available at: [http://localhost:3001](http://localhost:3001)

### Complaint delivery workers

The server runs two independent long-polling workers using [`sqs-consumer`](https://bbc.github.io/sqs-consumer/), which handles polling, acknowledgements, message deletion, and shutdown:

1. `POST /complaints/send ? complaints ? server worker ? SES target`.
2. After five unsuccessful processing attempts, SQS redrives the message: `complaints-dlq ? server worker ? SES user`.

The main worker sends from the verified `SES_EMAIL` identity to `SES_COMPLAINTS_EMAIL`, with the submitter as Reply-To. It deletes the SQS message only after SES returns a message ID. Failed sends, missing SES IDs, and malformed messages remain for retries and automatic redrive under the queue's `maxReceiveCount: 5` policy. A successful SES request means acceptance, not confirmed delivery. Later bounces are not processed; there is no SNS subscription or webhook.

The DLQ worker attempts one localized failure notification to the email stored in the complaint. The notification includes the SQS message ID as its complaint reference. It then deletes the DLQ message even if the SES request fails. Invalid DLQ payloads are logged and deleted. Notification failures do not enqueue another message or trigger another email attempt in that processing invocation.

Both workers receive one message per poll, using 20-second long polling and 60-second visibility, with five seconds between polling cycles. SES calls have a 15-second deadline and SDK automatic retries disabled. SQS requests, retries, and deletion are managed by the SDK and `sqs-consumer`; authentication errors also pause polling for five seconds. Worker errors are logged. Successful handlers explicitly return the original message to acknowledge it; target-send failures throw, while DLQ notification failures are caught and acknowledged. Shutdown stops new polling and waits up to 45 seconds for the final poll, active processing, and deletion, logging if this limit is exceeded. It does not abort SQS requests because that would also cancel acknowledgements. Registering routes alone does not start workers.

### AWS configuration and permissions

Use a verified `SES_EMAIL` identity and configure `SES_COMPLAINTS_EMAIL`. `SES_CONFIGURATION_SET` is optional. Region and credentials use the AWS SDK's normal configuration; deployments can use an IAM role. In the SES sandbox, real recipients must also be verified.

Requests with `debug: true` send both target emails and failure notifications to `success@simulator.amazonses.com`. A verified sender is still required. The delivery utility also exports `simulatorRecipients` for controlled SES tests. A simulated bounce occurs after SES acceptance and will not exercise SQS redrive; inject a failed SES API request to test that path.

The application identity requires `ses:SendEmail` for the configured identity (and configuration set, if used), plus `sqs:CreateQueue`, `sqs:GetQueueAttributes`, `sqs:SendMessage`, `sqs:ReceiveMessage`, and `sqs:DeleteMessage` for the complaint queues. The existing `complaints` and `complaints-dlq` queues are created or reused during startup. Queue URLs and the DLQ ARN must be present before workers start; queue initialization errors fail startup.

SQS provides at-least-once delivery. Process crashes, failed deletions, and uncertain SES request outcomes can cause duplicate target emails or failure notifications. Terminal notification handling does not guarantee exactly-once delivery across redeliveries or restarts. See [SQS visibility behavior](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) and [SES sending behavior](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-process.html).

### Deploying the queue-driven flow

1. Before starting workers, review both existing queues. The previous implementation retained queued complaints after sending emails, so blindly consuming the backlog can resend already delivered complaints. Resolve the backlog explicitly; this change never purges queues automatically. Old messages without a debug flag are treated as production messages, so historical debug submissions require particular care.
2. Grant the receive/delete IAM permissions above and deploy the server with its SES configuration. Update clients to treat `202 PROCESSING` as queue acceptance rather than completed delivery.
3. Verify a debug submission and its queue deletion. In controlled staging, force SES API failures to verify five processing attempts, automatic DLQ redrive, and the user notification. Also fail the notification request and verify that its DLQ message is deleted.
4. Remove any existing SNS webhook subscription and unused SNS event publishing configuration. `/webhook/ses` and `/webhook/resend` are unavailable, and `SES_SNS_TOPIC_ARN` is no longer used. Retire old Resend credentials if still present.
5. Monitor application processing/deletion errors, queue age, and DLQ backlog. Because the DLQ worker consumes failed complaints, application logs are needed to monitor terminal notification failures.
