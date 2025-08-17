package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/app/middleware"
	"github.com/ferizco/chat-app/server/app/security"
	"github.com/ferizco/chat-app/server/users/handlers"
)

func Register(app *fiber.App, db *gorm.DB, jwtSecret string) {
	// Inisialisasi blacklist JWT (bisa dipindah ke main jika perlu kontrol lifecycle)
	bl := security.NewJTIBlacklist()

	// Handlers
	auth := handlers.AuthHandler{DB: db, JWTSecret: jwtSecret, Blacklist: bl}
	cu := handlers.CreateUserHandler{DB: db}
	ah := handlers.AliasHandler{DB: db}
	uh := handlers.UserHandler{DB: db}
	cp := handlers.ChangePassHandler{DB: db}

	// Base groups
	api := app.Group("/api")
	v1 := api.Group("/v1")
	user := v1.Group("/user")

	// --- Public user endpoints (tanpa auth) ---
	user.Post("/login", auth.Login)
	user.Post("/create", cu.Create)
	user.Get("/listalias", ah.List_Alias)

	// --- Protected user endpoints (butuh auth middleware) ---
	protected := user.Group("/",
		middleware.AuthRequired(middleware.AuthConfig{
			Secret:    jwtSecret,
			Blacklist: bl,
		}),
	)
	protected.Post("/logout", auth.Logout)
	protected.Get("/listusers", uh.List)
	protected.Get("/profile", uh.Profile)
	protected.Post("/changepassword", cp.ChangePassword)
}
