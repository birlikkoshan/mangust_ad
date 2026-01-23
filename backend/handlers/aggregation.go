package handlers

import (
	"net/http"

	"mangust_ad/backend/database"
	"mangust_ad/backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type AggregationHandler struct{}

// GetSalesStats returns aggregated sales statistics
func (h *AggregationHandler) GetSalesStats(c *gin.Context) {
	pipeline := []bson.M{
		// Stage 1: Unwind items array
		{
			"$unwind": "$items",
		},
		// Stage 2: Lookup product details
		{
			"$lookup": bson.M{
				"from":         "products",
				"localField":   "items.productId",
				"foreignField": "_id",
				"as":           "product",
			},
		},
		// Stage 3: Unwind product array
		{
			"$unwind": "$product",
		},
		// Stage 4: Lookup category
		{
			"$lookup": bson.M{
				"from":         "categories",
				"localField":   "product.categoryId",
				"foreignField": "_id",
				"as":           "category",
			},
		},
		// Stage 5: Unwind category array
		{
			"$unwind": "$category",
		},
		// Stage 6: Group by category
		{
			"$group": bson.M{
				"_id": "$category.name",
				"totalRevenue": bson.M{
					"$sum": bson.M{
						"$multiply": []interface{}{"$items.price", "$items.quantity"},
					},
				},
				"totalQuantity": bson.M{
					"$sum": "$items.quantity",
				},
				"orderCount": bson.M{
					"$addToSet": "$_id",
				},
			},
		},
		// Stage 7: Calculate order count
		{
			"$project": bson.M{
				"category":      "$_id",
				"totalRevenue":  1,
				"totalQuantity": 1,
				"orderCount": bson.M{
					"$size": "$orderCount",
				},
			},
		},
		// Stage 8: Sort by revenue descending
		{
			"$sort": bson.M{
				"totalRevenue": -1,
			},
		},
	}

	cursor, err := database.DB.Collection("orders").Aggregate(c, pipeline)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to aggregate sales data")
		return
	}
	defer cursor.Close(c)

	var results []bson.M
	if err := cursor.All(c, &results); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode aggregation results")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Sales statistics fetched successfully", results)
}

// GetProductStats returns product statistics with average rating
func (h *AggregationHandler) GetProductStats(c *gin.Context) {
	pipeline := []bson.M{
		// Stage 1: Calculate average rating from embedded reviews
		{
			"$addFields": bson.M{
				"averageRating": bson.M{
					"$cond": bson.M{
						"if": bson.M{"$gt": []interface{}{bson.M{"$size": "$reviews"}, 0}},
						"then": bson.M{
							"$avg": "$reviews.rating",
						},
						"else": 0,
					},
				},
				"reviewCount": bson.M{
					"$size": "$reviews",
				},
			},
		},
		// Stage 2: Lookup category
		{
			"$lookup": bson.M{
				"from":         "categories",
				"localField":   "categoryId",
				"foreignField": "_id",
				"as":           "category",
			},
		},
		// Stage 3: Unwind category
		{
			"$unwind": bson.M{
				"path":                       "$category",
				"preserveNullAndEmptyArrays": true,
			},
		},
		// Stage 4: Project fields
		{
			"$project": bson.M{
				"name":         1,
				"price":        1,
				"stock":        1,
				"categoryName": "$category.name",
				"averageRating": bson.M{
					"$round": []interface{}{"$averageRating", 2},
				},
				"reviewCount": 1,
			},
		},
		// Stage 5: Sort by average rating descending
		{
			"$sort": bson.M{
				"averageRating": -1,
			},
		},
	}

	cursor, err := database.DB.Collection("products").Aggregate(c, pipeline)
	if err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to aggregate product data")
		return
	}
	defer cursor.Close(c)

	var results []bson.M
	if err := cursor.All(c, &results); err != nil {
		utils.SendErrorResponse(c, http.StatusInternalServerError, "Failed to decode aggregation results")
		return
	}

	utils.SendSuccessResponse(c, http.StatusOK, "Product statistics fetched successfully", results)
}
