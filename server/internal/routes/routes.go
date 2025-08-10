package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/internal/handlers"
	"github.com/ferizco/chat-app/server/internal/middleware"
)

func Register(app *fiber.App, db *gorm.DB, jwtSecret string) {
	// public
	app.Get("/api/hello", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Hello from Fiber"})
	})
	auth := handlers.AuthHandler{DB: db, JWTSecret: jwtSecret}
	app.Post("/api/auth/login", auth.Login)

	// protected
	app.Use("/api", middleware.AuthRequired(middleware.AuthConfig{Secret: jwtSecret}))
	uh := handlers.UserHandler{DB: db}
	app.Get("/api/users", uh.List)
}
