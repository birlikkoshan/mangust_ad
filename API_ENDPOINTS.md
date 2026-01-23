# API Endpoints Documentation

## Base URL
`http://localhost:8080/api`

## Authentication Endpoints

### 1. Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth**: Not required
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
- **Response**: `201 Created`
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

### 2. Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: Not required
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK`
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

## User Endpoints (Protected)

### 3. Get All Users
- **Method**: `GET`
- **Path**: `/users`
- **Auth**: Required (Bearer token)
- **Response**: `200 OK`
```json
{
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2026-01-23T10:00:00Z",
      "updatedAt": "2026-01-23T10:00:00Z"
    }
  ]
}
```

### 4. Get User by ID
- **Method**: `GET`
- **Path**: `/users/:id`
- **Auth**: Required
- **Response**: `200 OK`

### 5. Update User
- **Method**: `PUT`
- **Path**: `/users/:id`
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
- **Response**: `200 OK`

### 6. Delete User
- **Method**: `DELETE`
- **Path**: `/users/:id`
- **Auth**: Required
- **Response**: `200 OK`

## Category Endpoints (Protected)

### 7. Get All Categories
- **Method**: `GET`
- **Path**: `/categories`
- **Auth**: Required
- **Response**: `200 OK`

### 8. Get Category by ID
- **Method**: `GET`
- **Path**: `/categories/:id`
- **Auth**: Required
- **Response**: `200 OK`

### 9. Create Category
- **Method**: `POST`
- **Path**: `/categories`
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```
- **Response**: `201 Created`

### 10. Update Category
- **Method**: `PUT`
- **Path**: `/categories/:id`
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Electronics Updated",
  "description": "Updated description"
}
```
- **Response**: `200 OK`

### 11. Delete Category
- **Method**: `DELETE`
- **Path**: `/categories/:id`
- **Auth**: Required
- **Response**: `200 OK`

## Product Endpoints

### 12. Get All Products
- **Method**: `GET`
- **Path**: `/products`
- **Auth**: Not required (public)
- **Query Params**: `?categoryId=xxx` (optional)
- **Response**: `200 OK`

### 13. Get Product by ID
- **Method**: `GET`
- **Path**: `/products/:id`
- **Auth**: Not required (public)
- **Response**: `200 OK`

### 14. Create Product
- **Method**: `POST`
- **Path**: `/products`
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50,
  "categoryId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```
- **Response**: `201 Created`

### 15. Update Product
- **Method**: `PUT`
- **Path**: `/products/:id`
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Laptop Pro",
  "price": 1299.99,
  "stock": 30
}
```
- **Response**: `200 OK`

### 16. Delete Product
- **Method**: `DELETE`
- **Path**: `/products/:id`
- **Auth**: Required
- **Response**: `200 OK`

### 17. Add Review to Product
- **Method**: `POST`
- **Path**: `/products/:id/reviews`
- **Auth**: Required
- **Request Body**:
```json
{
  "rating": 5,
  "comment": "Excellent product!"
}
```
- **Response**: `200 OK`
- **Note**: Uses `$push` operator to add review to embedded array

## Order Endpoints (Protected)

### 18. Get All Orders
- **Method**: `GET`
- **Path**: `/orders`
- **Auth**: Required
- **Note**: Users see only their orders, admins see all
- **Response**: `200 OK`

### 19. Get Order by ID
- **Method**: `GET`
- **Path**: `/orders/:id`
- **Auth**: Required
- **Response**: `200 OK`

### 20. Create Order
- **Method**: `POST`
- **Path**: `/orders`
- **Auth**: Required
- **Request Body**:
```json
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
- **Response**: `201 Created`
- **Note**: Automatically updates product stock using `$inc` operator

### 21. Update Order Status
- **Method**: `PUT`
- **Path**: `/orders/:id/status`
- **Auth**: Required
- **Request Body**:
```json
{
  "status": "shipped"
}
```
- **Valid Statuses**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- **Response**: `200 OK`
- **Note**: Uses `$set` operator for update

### 22. Delete Order
- **Method**: `DELETE`
- **Path**: `/orders/:id`
- **Auth**: Required
- **Response**: `200 OK`
- **Note**: Restores product stock using `$inc` operator

## Statistics Endpoints (Protected, Aggregation)

### 23. Get Sales Statistics
- **Method**: `GET`
- **Path**: `/stats/sales`
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "message": "Sales statistics fetched successfully",
  "data": [
    {
      "category": "Electronics",
      "totalRevenue": 1999.98,
      "totalQuantity": 3,
      "orderCount": 2
    }
  ]
}
```
- **Note**: Uses aggregation pipeline with `$unwind`, `$lookup`, `$group`

### 24. Get Product Statistics
- **Method**: `GET`
- **Path**: `/stats/products`
- **Auth**: Required
- **Response**: `200 OK`
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
- **Note**: Uses aggregation to calculate average rating from embedded reviews

## Total: 24 Endpoints

### Summary by Collection:
- **Auth**: 2 endpoints
- **Users**: 4 endpoints (CRUD)
- **Categories**: 5 endpoints (CRUD)
- **Products**: 6 endpoints (CRUD + reviews)
- **Orders**: 5 endpoints (CRUD + status update)
- **Statistics**: 2 endpoints (aggregations)

### Advanced Features:
- ✅ Embedded documents (Reviews in Products)
- ✅ Referenced documents (Category in Products, User/Products in Orders)
- ✅ Advanced update operators: `$set`, `$inc`, `$push`
- ✅ Aggregation pipelines with multiple stages
- ✅ Compound indexes for optimization
- ✅ Authentication & Authorization
- ✅ Role-based access control
