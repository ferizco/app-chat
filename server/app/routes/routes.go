package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/app/middleware"
	"github.com/ferizco/chat-app/server/app/security"
	"github.com/ferizco/chat-app/server/users/handlers"
)

func Register(app *fiber.App, db *gorm.DB, jwtSecret string) {
	// Inisialisasi blacklist (bisa dipindah ke main untuk lifecycle control)
	bl := security.NewJTIBlacklist()

	auth := handlers.AuthHandler{DB: db, JWTSecret: jwtSecret, Blacklist: bl}
	app.Post("/api/auth/login", auth.Login)

	cu := handlers.CreateUserHandler{DB: db}
	app.Post("/api/create/user", cu.Create)

	ah := handlers.AliasHandler{DB: db}
	app.Get("/api/alias", ah.List_Alias)

	app.Use("/api", middleware.AuthRequired(middleware.AuthConfig{
		Secret: jwtSecret, Blacklist: bl,
	}))
	app.Post("/api/auth/logout", auth.Logout)

	// Users
	uh := handlers.UserHandler{DB: db}
	app.Get("/api/users", uh.List)

}
