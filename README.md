# Boom Chat 💬

A full-stack real-time chat application built with **NestJS**, **Next.js**, **WebSocket**, and **PostgreSQL**.

## Project Structure

```
boom-chat/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
└── docker-compose.yml
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

## Quick Start

### Using Docker Compose (Recommended)

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **PostgreSQL**: localhost:5432

To stop services:
```bash
npm run dev:down
```

### Local Development

#### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env.local)
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=boom_chat
JWT_ACCESS_SECRET=dev_access_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Features

- ✅ User Authentication (JWT)
- ✅ Real-time Chat (WebSocket)
- ✅ User Profiles
- ✅ Image Upload (Cloudinary)
- ✅ Message History
- ✅ Responsive UI (Tailwind CSS)

## Available Scripts

### Root Level
- `npm run dev` - Start all services with Docker Compose
- `npm run dev:down` - Stop all services
- `npm run build` - Build Docker images
- `npm run backend:install` - Install backend dependencies
- `npm run backend:dev` - Run backend in development mode
- `npm run frontend:install` - Install frontend dependencies
- `npm run frontend:dev` - Run frontend in development mode

### Backend
- `npm run start:dev` - Start in watch mode
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

### Chat Endpoints
- `GET /chat/messages` - Get chat messages
- `POST /chat/messages` - Send message (WebSocket)

### Profile Endpoints
- `GET /profile/:userId` - Get user profile
- `PUT /profile` - Update user profile

### Upload Endpoints
- `POST /upload/avatar` - Upload avatar

## Database

PostgreSQL database runs in a Docker container. To access:

```bash
docker-compose exec db psql -U postgres -d boom_chat
```

## Deployment

For production deployment:

1. Update environment variables in `.env`
2. Build Docker images: `npm run build`
3. Deploy using your preferred platform (AWS, Heroku, DigitalOcean, etc.)

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill process using port
kill -9 <PID>
```

### Database Connection Issues
```bash
# Verify Docker container is running
docker ps

# Check database logs
docker-compose logs db
```

### Build Issues
```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## License

UNLICENSED

## Support

For issues and questions, please create an issue in the repository.
