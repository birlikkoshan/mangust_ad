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

type OrderHandler struct{}

type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items" binding:"required,min=1"`
}

type OrderItemRequest struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending processing shipped delivered cancelled"`
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	// Admin can see all orders, users see only their own
	userIDStr, _ := c.Get("userId")
	role, _ := c.Get("role")
	
	query := bson.M{}
	if role != "admin" {
		userID, _ := primitive.ObjectIDFromHex(userIDStr.(string))
		query["userId"] = userID
	}

	cursor, err := database.DB.Collection("orders").Find(c, query, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders")
		return
	}
	defer cursor.Close(c)

	var orders []models.Order
	if err := cursor.All(c, &orders); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode orders")
		return
	}

	// Populate user and product references
	for i := range orders {
		// Populate user
		if !orders[i].UserID.IsZero() {
			var user models.User
			database.DB.Collection("users").FindOne(c, bson.M{"_id": orders[i].UserID}).Decode(&user)
			user.Password = ""
			orders[i].User = &user
		}

		// Populate products
		for j := range orders[i].Items {
			if !orders[i].Items[j].ProductID.IsZero() {
				var product models.Product
				database.DB.Collection("products").FindOne(c, bson.M{"_id": orders[i].Items[j].ProductID}).Decode(&product)
				orders[i].Items[j].Product = &product
			}
		}
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Orders fetched successfully", orders)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	var order models.Order
	err = database.DB.Collection("orders").FindOne(c, bson.M{"_id": objectID}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Order not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	// Check authorization
	userIDStr, _ := c.Get("userId")
	role, _ := c.Get("role")
	if role != "admin" && order.UserID.Hex() != userIDStr {
		utils.SendErrorResponse(c, http.StatusForbidden, "Access denied")
		return
	}

	// Populate user
	if !order.UserID.IsZero() {
		var user models.User
		database.DB.Collection("users").FindOne(c, bson.M{"_id": order.UserID}).Decode(&user)
		user.Password = ""
		order.User = &user
	}

	// Populate products
	for i := range order.Items {
		if !order.Items[i].ProductID.IsZero() {
			var product models.Product
			database.DB.Collection("products").FindOne(c, bson.M{"_id": order.Items[i].ProductID}).Decode(&product)
			order.Items[i].Product = &product
		}
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Order fetched successfully", order)
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userIDStr, _ := c.Get("userId")
	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var total float64
	var orderItems []models.OrderItem

	// Validate products and calculate total
	for _, itemReq := range req.Items {
		productID, err := primitive.ObjectIDFromHex(itemReq.ProductID)
		if err != nil {
			utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid product ID: "+itemReq.ProductID)
			return
		}

		var product models.Product
		err = database.DB.Collection("products").FindOne(c, bson.M{"_id": productID}).Decode(&product)
		if err != nil {
			utils.SendErrorResponse(c, http.StatusNotFound, "Product not found: "+itemReq.ProductID)
			return
		}

		if product.Stock < itemReq.Quantity {
			utils.SendErrorResponse(c, http.StatusBadRequest, "Insufficient stock for product: "+product.Name)
			return
		}

		itemTotal := product.Price * float64(itemReq.Quantity)
		total += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: productID,
			Quantity:  itemReq.Quantity,
			Price:     product.Price,
		})
	}

	order := models.Order{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Items:     orderItems,
		Total:     total,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = database.DB.Collection("orders").InsertOne(c, order)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to create order")
		return
	}

	// Update product stock using $inc operator
	for _, item := range orderItems {
		database.DB.Collection("products").UpdateOne(
			c,
			bson.M{"_id": item.ProductID},
			bson.M{"$inc": bson.M{"stock": -item.Quantity}},
		)
	}

	utils.SendSuccessResponse(c, http.StatusCreated, "Order created successfully", order)
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Use $set operator for update
	result := database.DB.Collection("orders").FindOneAndUpdate(
		c,
		bson.M{"_id": objectID},
		bson.M{
			"$set": bson.M{
				"status":    req.Status,
				"updatedAt": time.Now(),
			},
		},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Order not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to update order")
		}
		return
	}

	var order models.Order
	result.Decode(&order)
	utils.SendSuccessResponse(c, http.StatusOK, "Order status updated successfully", order)
}

func (h *OrderHandler) DeleteOrder(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Get order first to restore stock
	var order models.Order
	err = database.DB.Collection("orders").FindOne(c, bson.M{"_id": objectID}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.SendErrorResponse(c, http.StatusNotFound, "Order not found")
		} else {
			utils.SendErrorResponse(c, http.StatusInternalServerError, "Database error")
		}
		return
	}

	// Check authorization
	userIDStr, _ := c.Get("userId")
	role, _ := c.Get("role")
	if role != "admin" && order.UserID.Hex() != userIDStr {
		utils.SendErrorResponse(c, http.StatusForbidden, "Access denied")
		return
	}

	// Restore product stock using $inc operator
	for _, item := range order.Items {
		database.DB.Collection("products").UpdateOne(
			c,
			bson.M{"_id": item.ProductID},
			bson.M{"$inc": bson.M{"stock": item.Quantity}},
		)
	}

	// Delete order
	result, err := database.DB.Collection("orders").DeleteOne(c, bson.M{"_id": objectID})
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to delete order")
		return
	}

	if result.DeletedCount == 0 {
		utils.SendErrorResponse(c, http.StatusNotFound, "Order not found")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Order deleted successfully", nil)
}
