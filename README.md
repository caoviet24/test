# E-Learning Server

Backend server for the E-Learning platform built with Express.js, Prisma, MySQL, Socket.IO, and rate limiting.

## Project Structure

```
server/
├── controllers/         # Request handlers
│   └── userController.js
├── repositories/        # Database operations
│   └── userRepository.js
├── routes/             # API routes
│   └── users.js
├── prisma/             # Database schema and migrations
│   └── schema.prisma
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── index.js           # Main application file
└── package.json
```

## Architecture

- **Controllers**: Handle HTTP requests and responses, input validation, and business logic
- **Repositories**: Handle database operations and data access logic
- **Routes**: Define API endpoints and connect them to controllers
- **Prisma**: ORM for database operations with MySQL

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the environment variables in `.env`
```bash
# Required variables:
PORT=8000
DATABASE_URL="mysql://user:password@localhost:3306/elearning"
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUEST=100
```

3. Initialize database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

### Using Docker Compose (Recommended)

1. Start the application and database:
```bash
docker-compose up -d
```

2. The server will be available at `http://localhost:8000`
3. MySQL database will be accessible at `localhost:3306`

To stop the containers:
```bash
docker-compose down
```

To rebuild the containers after making changes:
```bash
docker-compose up -d --build
```

### Environment Variables for Docker

The following environment variables are pre-configured in docker-compose.yml:
- `DATABASE_URL`: mysql://user:password@db:3306/elearning
- MySQL credentials:
  - Database: elearning
  - User: user
  - Password: password
  - Root Password: rootpassword

### Using Docker without Compose

Build the image:
```bash
docker build -t elearning-server .
```

Run the container:
```bash
docker run -p 8000:8000 -d elearning-server
```

## Scripts

- `npm run dev` - Run server in development mode with nodemon
- `npm start` - Run server in production mode
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations