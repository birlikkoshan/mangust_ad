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

type CategoryHandler struct{}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	cursor, err := database.DB.Collection("categories").Find(c, bson.M{})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	defer cursor.Close(c)

	var categories []models.Category
	if err := cursor.All(c, &categories); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode categories")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Categories fetched successfully", categories)
}

func (h *CategoryHandler) GetCategory(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}

	var category models.Category
	err = database.DB.Collection("categories").FindOne(c, bson.M{"_id": objectID}).Decode(&category)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Category not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Category fetched successfully", category)
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	category := models.Category{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result, err := database.DB.Collection("categories").InsertOne(c, category)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to create category")
		return
	}

	category.ID = result.InsertedID.(primitive.ObjectID)
	utils.SendSuccessResponse(c, http.StatusCreated, "Category created successfully", category)
}

func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}

	var req UpdateCategoryRequest
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

	result := database.DB.Collection("categories").FindOneAndUpdate(
		c,
		bson.M{"_id": objectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Category not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to update category")
		}
		return
	}

	var category models.Category
	result.Decode(&category)
	utils.SendSuccessResponse(c, http.StatusOK, "Category updated successfully", category)
}

func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid category ID")
		return
	}

	// Check if category is used by products
	count, err := database.DB.Collection("products").CountDocuments(c, bson.M{"categoryId": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	if count > 0 {
		utils.SendErrorResponse(c, http.StatusConflict, "Cannot delete category with associated products")
		return
	}

	result, err := database.DB.Collection("categories").DeleteOne(c, bson.M{"_id": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to delete category")
		return
	}

	if result.DeletedCount == 0 {
		utils.SendErrorResponse(c, http.StatusNotFound, "Category not found")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Category deleted successfully", nil)
}
