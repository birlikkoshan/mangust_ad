package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"mangust_ad/backend/config"
	"mangust_ad/backend/database"
	"mangust_ad/backend/handlers"
	"mangust_ad/backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.Connect()
	defer database.Disconnect()

	// Setup router
	router := setupRouter()

	// Start server
	port := ":" + config.AppConfig.Port
	log.Printf("Server starting on port %s", port)

	// Graceful shutdown
	go func() {
		if err := router.Run(port); err != nil {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
}

func setupRouter() *gin.Engine {
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{config.AppConfig.CORSOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	authHandler := &handlers.AuthHandler{}
	userHandler := &handlers.UserHandler{}
	categoryHandler := &handlers.CategoryHandler{}
	productHandler := &handlers.ProductHandler{}
	orderHandler := &handlers.OrderHandler{}
	aggregationHandler := &handlers.AggregationHandler{}

	// Public routes
	api := router.Group("/api")
	{
		// Auth routes
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		// Public product routes
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/:id", productHandler.GetProduct)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Admin-only auth route to create new admins
		admin := protected.Group("")
		admin.Use(middleware.AdminOnly())
		{
			admin.POST("/auth/admin", authHandler.RegisterAdmin)
		}

		// User routes
		protected.GET("/users", userHandler.GetUsers)
		protected.GET("/users/:id", userHandler.GetUser)
		protected.PUT("/users/:id", userHandler.UpdateUser)
		protected.DELETE("/users/:id", userHandler.DeleteUser)

		// Category routes
		protected.GET("/categories", categoryHandler.GetCategories)
		protected.GET("/categories/:id", categoryHandler.GetCategory)
		protected.POST("/categories", categoryHandler.CreateCategory)
		protected.PUT("/categories/:id", categoryHandler.UpdateCategory)
		protected.DELETE("/categories/:id", categoryHandler.DeleteCategory)

		// Product routes (protected)
		protected.POST("/products", productHandler.CreateProduct)
		protected.PUT("/products/:id", productHandler.UpdateProduct)
		protected.DELETE("/products/:id", productHandler.DeleteProduct)
		protected.POST("/products/:id/reviews", productHandler.AddReview)

		// Order routes
		protected.GET("/orders", orderHandler.GetOrders)
		protected.GET("/orders/:id", orderHandler.GetOrder)
		protected.POST("/orders", orderHandler.CreateOrder)
		protected.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
		protected.DELETE("/orders/:id", orderHandler.DeleteOrder)

		// Aggregation routes
		protected.GET("/stats/sales", aggregationHandler.GetSalesStats)
		protected.GET("/stats/products", aggregationHandler.GetProductStats)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return router
}
