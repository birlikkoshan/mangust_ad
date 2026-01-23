package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	MongoURI    string
	DBName      string
	JWTSecret   string
	CORSOrigin  string
}

var AppConfig *Config

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		Port:       getEnv("PORT", "8080"),
		MongoURI:   getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		DBName:     getEnv("DB_NAME", "mangust_ad"),
		JWTSecret:  getEnv("JWT_SECRET", "default-secret-change-in-production"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
