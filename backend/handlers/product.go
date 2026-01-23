package handlers

import (
	"net/http"
	"time"

	"mangust_ad/backend/database"
	"mangust_ad/backend/models"
	"mangust_ad/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProductHandler struct{}

type CreateProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"gte=0"`
	CategoryID  string  `json:"categoryId" binding:"required"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"omitempty,gt=0"`
	Stock       int     `json:"stock" binding:"omitempty,gte=0"`
	CategoryID  string  `json:"categoryId"`
}

type AddReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment" binding:"required"`
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	// Support query parameters for filtering
	categoryID := c.Query("categoryId")
	query := bson.M{}

	if categoryID != "" {
		catID, err := primitive.ObjectIDFromHex(categoryID)
		if err == nil {
			query["categoryId"] = catID
		}
	}

	cursor, err := database.DB.Collection("products").Find(c, query)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to fetch products")
		return
	}
	defer cursor.Close(c)

	var products []models.Product
	if err := cursor.All(c, &products); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode products")
		return
	}

	// Populate category references
	for i := range products {
		if !products[i].CategoryID.IsZero() {
			var category models.Category
			database.DB.Collection("categories").FindOne(c, bson.M{"_id": products[i].CategoryID}).Decode(&category)
			products[i].Category = &category
		}
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Products fetched successfully", products)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid product ID")
		return
	}

	var product models.Product
	err = database.DB.Collection("products").FindOne(c, bson.M{"_id": objectID}).Decode(&product)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Product not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	// Populate category
	if !product.CategoryID.IsZero() {
		var category models.Category
		database.DB.Collection("categories").FindOne(c, bson.M{"_id": product.CategoryID}).Decode(&category)
		product.Category = &category
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Product fetched successfully", product)
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	categoryID, err := primitive.ObjectIDFromHex(req.CategoryID)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}

	// Verify category exists
	var category models.Category
	err = database.DB.Collection("categories").FindOne(c, bson.M{"_id": categoryID}).Decode(&category)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusNotFound, "Category not found")
		return
	}

	product := models.Product{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		CategoryID:  categoryID,
		Reviews:     []models.Review{},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result, err := database.DB.Collection("products").InsertOne(c, product)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to create product")
		return
	}

	product.ID = result.InsertedID.(primitive.ObjectID)
	product.Category = &category
	utils.SendSuccessResponse(c, http.StatusCreated, "Product created successfully", product)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid product ID")
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	if req.Name != "" {
		update["$set"].(bson.M)["name"] = req.Name
	}
	if req.Description != "" {
		update["$set"].(bson.M)["description"] = req.Description
	}
	if req.Price > 0 {
		update["$set"].(bson.M)["price"] = req.Price
	}
	if req.Stock >= 0 {
		update["$set"].(bson.M)["stock"] = req.Stock
	}
	if req.CategoryID != "" {
		categoryID, err := primitive.ObjectIDFromHex(req.CategoryID)
		if err != nil {
			utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
			return
		}
		// Verify category exists
		var category models.Category
		err = database.DB.Collection("categories").FindOne(c, bson.M{"_id": categoryID}).Decode(&category)
		if err != nil {
			utils.SendErrorResponse(c, http.StatusNotFound, "Category not found")
			return
		}
		update["$set"].(bson.M)["categoryId"] = categoryID
	}

	result := database.DB.Collection("products").FindOneAndUpdate(
		c,
		bson.M{"_id": objectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Product not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to update product")
		}
		return
	}

	var product models.Product
	result.Decode(&product)
	
	// Populate category
	if !product.CategoryID.IsZero() {
		var category models.Category
		database.DB.Collection("categories").FindOne(c, bson.M{"_id": product.CategoryID}).Decode(&category)
		product.Category = &category
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Product updated successfully", product)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid product ID")
		return
	}

	// Check if product is in any orders
	count, err := database.DB.Collection("orders").CountDocuments(c, bson.M{"items.productId": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	if count > 0 {
		utils.SendErrorResponse(c, http.StatusConflict, "Cannot delete product with associated orders")
		return
	}

	result, err := database.DB.Collection("products").DeleteOne(c, bson.M{"_id": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to delete product")
		return
	}

	if result.DeletedCount == 0 {
		utils.SendErrorResponse(c, http.StatusNotFound, "Product not found")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Product deleted successfully", nil)
}

func (h *ProductHandler) AddReview(c *gin.Context) {
	id := c.Param("id")
	productID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid product ID")
		return
	}

	var req AddReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get user from context
	userIDStr, exists := c.Get("userId")
	if !exists {
		utils.SendErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Get user name
	var user models.User
	err = database.DB.Collection("users").FindOne(c, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	review := models.Review{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		UserName:  user.Name,
		Rating:    req.Rating,
		Comment:   req.Comment,
		CreatedAt: time.Now(),
	}

	// Use $push to add review to embedded array
	result := database.DB.Collection("products").FindOneAndUpdate(
		c,
		bson.M{"_id": productID},
		bson.M{
			"$push": bson.M{"reviews": review},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Product not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to add review")
		}
		return
	}

	var product models.Product
	result.Decode(&product)
	utils.SendSuccessResponse(c, http.StatusOK, "Review added successfully", product)
}
