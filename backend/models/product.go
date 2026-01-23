package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Review is embedded in Product (embedded document)
type Review struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	UserName  string             `json:"userName" bson:"userName"`
	Rating    int                `json:"rating" bson:"rating"` // 1-5
	Comment   string             `json:"comment" bson:"comment"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

// Product with embedded reviews and referenced category
type Product struct {
	ID          primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Name        string               `json:"name" bson:"name"`
	Description string               `json:"description" bson:"description"`
	Price       float64              `json:"price" bson:"price"`
	Stock       int                  `json:"stock" bson:"stock"`
	CategoryID  primitive.ObjectID   `json:"categoryId" bson:"categoryId"` // Reference to Category
	Category    *Category            `json:"category,omitempty" bson:"-"`   // Populated on read
	Reviews     []Review             `json:"reviews" bson:"reviews"`        // Embedded documents
	CreatedAt   time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time            `json:"updatedAt" bson:"updatedAt"`
}
