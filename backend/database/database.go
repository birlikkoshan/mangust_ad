package database

import (
	"context"
	"log"
	"time"

	"mangust_ad/backend/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
var Client *mongo.Client

func Connect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.AppConfig.MongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	Client = client
	DB = client.Database(config.AppConfig.DBName)

	log.Println("Connected to MongoDB successfully")
	createIndexes()
}

func Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := Client.Disconnect(ctx); err != nil {
		log.Fatal("Failed to disconnect from MongoDB:", err)
	}

	log.Println("Disconnected from MongoDB")
}

func createIndexes() {
	ctx := context.Background()

	// Compound index on Users: email (unique)
	usersCollection := DB.Collection("users")
	usersIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{"email": 1},
		Options: options.Index().SetUnique(true),
	}
	usersCollection.Indexes().CreateOne(ctx, usersIndexModel)

	// Compound index on Products: categoryId + price
	productsCollection := DB.Collection("products")
	productsIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"categoryId": 1,
			"price":      1,
		},
	}
	productsCollection.Indexes().CreateOne(ctx, productsIndexModel)

	// Compound index on Orders: userId + createdAt
	ordersCollection := DB.Collection("orders")
	ordersIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"userId":    1,
			"createdAt": -1,
		},
	}
	ordersCollection.Indexes().CreateOne(ctx, ordersIndexModel)

	// Compound index on Orders: status + createdAt
	ordersStatusIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"status":    1,
			"createdAt": -1,
		},
	}
	ordersCollection.Indexes().CreateOne(ctx, ordersStatusIndexModel)

	log.Println("Database indexes created successfully")
}
