# Mangust AD - Full-Stack E-Commerce Application

A complete web application built with **Vite + React + TypeScript** (frontend) and **Go + Gin + MongoDB** (backend).

## Features

- ? **CRUD Operations** across multiple collections (Users, Products, Categories, Orders)
- ? **Embedded Documents**: Reviews embedded in Products
- ? **Referenced Documents**: Products reference Categories, Orders reference Users and Products
- ? **Advanced MongoDB Operators**: `$set`, `$inc`, `$push`, `$unset`, `$addToSet`
- ? **Aggregation Endpoints**: Sales statistics and product statistics
- ? **Compound Indexes**: Multiple compound indexes for optimized queries
- ? **Authentication & Authorization**: JWT-based auth with role-based access control
- ? **12+ REST Endpoints**: Comprehensive API coverage

## Project Structure

```
mangust_ad/
??? backend/
?   ??? config/          # Configuration management
?   ??? database/        # MongoDB connection and indexes
?   ??? handlers/        # HTTP handlers (controllers)
?   ??? middleware/      # Auth middleware
?   ??? models/          # Data models
?   ??? utils/           # Utility functions
?   ??? main.go          # Application entry point
?   ??? go.mod           # Go dependencies
?   ??? .env.example     # Environment variables template
??? frontend/
?   ??? src/
?   ?   ??? api/         # API client and endpoints
?   ?   ??? components/  # React components
?   ?   ??? pages/       # Page components
?   ?   ??? App.tsx      # Main app component
?   ?   ??? main.tsx     # Entry point
?   ??? package.json
?   ??? vite.config.ts
??? README.md
```

## Backend Setup

### Prerequisites
- Go 1.21+
- MongoDB 4.4+

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mangust_ad
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

5. Run the server:
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:8080):
```
VITE_API_URL=http://localhost:8080/api/v1
```

4. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories (Protected)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)
- `POST /api/products/:id/reviews` - Add review to product (protected)

### Orders (Protected)
- `GET /api/orders` - Get all orders (user sees own, admin sees all)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Statistics (Protected)
- `GET /api/stats/sales` - Get sales statistics by category
- `GET /api/stats/products` - Get product statistics with ratings

## Postman Collection Examples

### Register User
```json
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2026-01-23T10:00:00Z",
    "updatedAt": "2026-01-23T10:00:00Z"
  }
}
```

### Login
```json
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Category
```json
POST http://localhost:8080/api/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### Create Product
```json
POST http://localhost:8080/api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50,
  "categoryId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Add Review to Product
```json
POST http://localhost:8080/api/products/65a1b2c3d4e5f6g7h8i9j0k1/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product!"
}
```

### Create Order
```json
POST http://localhost:8080/api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quantity": 2
    },
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "quantity": 1
    }
  ]
}
```

### Update Order Status (Advanced Update Operator)
```json
PUT http://localhost:8080/api/orders/65a1b2c3d4e5f6g7h8i9j0k1/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}
```

### Get Sales Statistics (Aggregation)
```json
GET http://localhost:8080/api/stats/sales
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Sales statistics fetched successfully",
  "data": [
    {
      "category": "Electronics",
      "totalRevenue": 1999.98,
      "totalQuantity": 3,
      "orderCount": 2
    },
    {
      "category": "Books",
      "totalRevenue": 49.99,
      "totalQuantity": 1,
      "orderCount": 1
    }
  ]
}
```

### Get Product Statistics (Aggregation)
```json
GET http://localhost:8080/api/stats/products
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Product statistics fetched successfully",
  "data": [
    {
      "name": "Laptop",
      "price": 999.99,
      "stock": 48,
      "categoryName": "Electronics",
      "averageRating": 4.5,
      "reviewCount": 10
    }
  ]
}
```

## Database Models

### User
- Embedded fields: None
- References: None
- Indexes: `email` (unique)

### Category
- Embedded fields: None
- References: None
- Indexes: None

### Product
- **Embedded**: `reviews[]` (Review documents)
- **References**: `categoryId` ? Category
- Indexes: Compound index on `categoryId + price`

### Order
- **Embedded**: `items[]` (OrderItem documents)
- **References**: `userId` ? User, `items[].productId` ? Product
- Indexes: Compound indexes on `userId + createdAt`, `status + createdAt`

## Advanced MongoDB Features

### Update Operators Used
- `$set`: Update fields
- `$inc`: Increment/decrement numeric values (stock updates)
- `$push`: Add to arrays (reviews)
- `$unset`: Remove fields (soft delete option)

### Aggregation Pipeline
- `$unwind`: Expand arrays
- `$lookup`: Join collections
- `$group`: Aggregate data
- `$project`: Shape output
- `$sort`: Order results

### Compound Indexes
1. **Users**: `email` (unique)
2. **Products**: `categoryId + price`
3. **Orders**: `userId + createdAt`, `status + createdAt`

## Authentication Flow

1. User registers/login ? receives JWT token
2. Token stored in localStorage (frontend)
3. Token sent in `Authorization: Bearer <token>` header
4. Middleware validates token and extracts user info
5. Role-based access control (admin vs user)

## Frontend Pages

- **Login/Register**: Authentication
- **Products**: List, create, delete products
- **Product Detail**: View product with reviews, add reviews
- **Categories**: Full CRUD for categories
- **Orders**: Create orders, view orders, update status
- **Statistics**: View sales and product statistics

## Development Notes

- Backend uses centralized error handling via `utils.ErrorResponse`
- Frontend uses axios interceptors for token management
- CORS configured for development
- Environment variables for configuration
- Clean separation of concerns

## License

This project is created for educational purposes.
