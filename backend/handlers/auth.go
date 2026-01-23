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
)

type AuthHandler struct{}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Bad Request: "+err.Error())
		return
	}

	// Check if user exists
	var existingUser models.User
	err := database.DB.Collection("users").FindOne(c, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		utils.SendErrorResponse(c, http.StatusConflict, "Email already registered")
		return
	}
	if err != mongo.ErrNoDocuments {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Create user
	user := models.User{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		Password:  req.Password,
		Name:      req.Name,
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := user.HashPassword(); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	_, err = database.DB.Collection("users").InsertOne(c, user)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to create user")
		return
	}

	user.Password = ""
	utils.SendSuccessResponse(c, http.StatusCreated, "User registered successfully", user)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	err := database.DB.Collection("users").FindOne(c, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	if !user.CheckPassword(req.Password) {
		utils.SendErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Role)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	user.Password = ""
	utils.SendSuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"user":  user,
		"token": token,
	})
}
