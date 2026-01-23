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

type UserHandler struct{}

type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email" binding:"omitempty,email"`
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	cursor, err := database.DB.Collection("users").Find(c, bson.M{})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to fetch users")
		return
	}
	defer cursor.Close(c)

	var users []models.User
	if err := cursor.All(c, &users); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode users")
		return
	}

	// Remove passwords
	for i := range users {
		users[i].Password = ""
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Users fetched successfully", users)
}

func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var user models.User
	err = database.DB.Collection("users").FindOne(c, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "User not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	user.Password = ""
	utils.SendSuccessResponse(c, http.StatusOK, "User fetched successfully", user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Check if email is being changed and if it's already taken
	if req.Email != "" {
		var existingUser models.User
		err := database.DB.Collection("users").FindOne(c, bson.M{"email": req.Email, "_id": bson.M{"$ne": objectID}}).Decode(&existingUser)
		if err == nil {
			utils.SendErrorResponse(c, http.StatusConflict, "Email already in use")
			return
		}
	}

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now(),
		},
	}

	if req.Name != "" {
		update["$set"].(bson.M)["name"] = req.Name
	}
	if req.Email != "" {
		update["$set"].(bson.M)["email"] = req.Email
	}

	result := database.DB.Collection("users").FindOneAndUpdate(
		c,
		bson.M{"_id": objectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "User not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to update user")
		}
		return
	}

	var user models.User
	result.Decode(&user)
	user.Password = ""
	utils.SendSuccessResponse(c, http.StatusOK, "User updated successfully", user)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Use $unset to mark as deleted (soft delete) or hard delete
	result, err := database.DB.Collection("users").DeleteOne(c, bson.M{"_id": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	if result.DeletedCount == 0 {
		utils.SendErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "User deleted successfully", nil)
}
