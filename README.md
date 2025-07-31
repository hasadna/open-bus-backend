# Open Bus Backend

### Swagger UI

The API documentation is automatically generated and available at:

```
http://localhost:3001/docs
```

## API Endpoints

### Health Check

- **GET** `/` - Health check endpoint

#### GitHub Issues

- **POST** `/issues` - Create a new GitHub issue
- Requires: title, contactName, contactEmail, description, environment, expectedBehavior, actualBehavior, reproducibility
- Optional: attachments (array of URLs)

#### Complaints

- **POST** `/complaints` - Submit a complaint to government forms
- Requires: userData (firstName, lastName, id, email, phone), databusData (operator)
- Optional: debug mode for testing, complaintType, description

#### Government Transportation API

The following endpoints provide access to government transportation data:

- **POST** `/gov/lines-by-station` - Get bus lines by station
  - Requires: EventDate (DD/MM/YYYY), OperatorId, StationId

- **POST** `/gov/stations-by-line` - Get stations by line
  - Requires: eventDate (DD/MM/YYYY), OperatorId, OfficelineId, Directions

- **POST** `/gov/subjects` - Get subject types for vehicles
  - Requires: listName (set to "subject_type_vehicles")

- **POST** `/gov/train-stations` - Get train stations
  - Requires: StationTypeId

- **POST** `/gov/pniya` - Get pniya (vehicles type)
  - Requires: listName (set to "pniya")

- **POST** `/gov/not-real-numbers` - Get not real numbers
  - Requires: listName (set to "notrealnumbers")

- **POST** `/gov/lines-by-line` - Get lines by line ID
  - Requires: eventDate (DD/MM/YYYY), OperatorId, OperatorLineId

- **POST** `/gov/cities` - Get cities list
  - No body required

- **GET** `/gov/time` - Get current server time
  - No body required

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following variables:

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

# Fix linting issues
npm run lint:fix
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
  -e LOG_LEVEL=info \
  open-bus-backend
```

Replace the environment variable values with your actual configuration.

The server will be accessible at `http://localhost:3001`.
