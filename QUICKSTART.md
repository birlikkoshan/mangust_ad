# Quick Start Guide

## Prerequisites

- **Go 1.21+** installed
- **Node.js 18+** and npm installed
- **MongoDB** running (local or remote)

## Step 1: Start MongoDB

Make sure MongoDB is running on `localhost:27017` (default) or update the connection string in `.env`.

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Go dependencies
go mod download

# Create .env file
cp .env.example .env

# Edit .env and set your MongoDB URI and JWT secret
# PORT=8080
# MONGODB_URI=mongodb://localhost:27017
# DB_NAME=mangust_ad
# JWT_SECRET=your-super-secret-jwt-key
# CORS_ORIGIN=http://localhost:5173

# Run the backend server
go run main.go
```

Backend will start on `http://localhost:8080`

## Step 3: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

## Step 4: Test the Application

1. Open `http://localhost:5173` in your browser
2. Register a new user
3. Login with your credentials
4. Start creating categories, products, and orders!

## Testing with Postman

1. Import the endpoints from `API_ENDPOINTS.md`
2. Start with `/api/auth/register` to create a user
3. Use `/api/auth/login` to get a JWT token
4. Add `Authorization: Bearer <token>` header to protected endpoints
5. Test all CRUD operations

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify connection string in `.env`

### Port Already in Use
- Change `PORT` in backend `.env` file
- Update `CORS_ORIGIN` to match your frontend port

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Default: `http://localhost:5173`

### Frontend Can't Connect to Backend
- Verify backend is running on port 8080
- Check `VITE_API_URL` in frontend `.env` (optional, defaults to localhost:8080)

## Project Structure

```
mangust_ad/
├── backend/          # Go + Gin + MongoDB backend
│   ├── config/       # Configuration
│   ├── database/     # MongoDB connection
│   ├── handlers/     # API handlers
│   ├── middleware/   # Auth middleware
│   ├── models/       # Data models
│   └── utils/        # Utilities
└── frontend/         # React + TypeScript frontend
    └── src/
        ├── api/      # API client
        ├── pages/    # Page components
        └── components/
```

## Next Steps

- Read `README.md` for detailed documentation
- Check `API_ENDPOINTS.md` for all available endpoints
- Explore the codebase to understand the architecture
