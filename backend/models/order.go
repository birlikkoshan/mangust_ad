package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// OrderItem represents an item in an order
type OrderItem struct {
	ProductID primitive.ObjectID `json:"productId" bson:"productId"`
	Product   *Product            `json:"product,omitempty" bson:"-"` // Populated on read
	Quantity  int                 `json:"quantity" bson:"quantity"`
	Price     float64             `json:"price" bson:"price"` // Price at time of order
}

// Order with references to User and Products
type Order struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `json:"userId" bson:"userId"`     // Reference to User
	User       *User              `json:"user,omitempty" bson:"-"`   // Populated on read
	Items      []OrderItem        `json:"items" bson:"items"`       // References to Products
	Total      float64            `json:"total" bson:"total"`
	Status     string             `json:"status" bson:"status"` // "pending", "processing", "shipped", "delivered", "cancelled"
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt  time.Time          `json:"updatedAt" bson:"updatedAt"`
}
