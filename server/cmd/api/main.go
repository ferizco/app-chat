package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/ferizco/chat-app/server/app/config"
	"github.com/ferizco/chat-app/server/app/db"
	"github.com/ferizco/chat-app/server/app/routes"
)

func main() {
	cfg := config.Load()
	d := db.Open(cfg.DSN)

	app := fiber.New()
	app.Use(recover.New(), logger.New())

	routes.Register(app, d, cfg.JWTSecret)

	log.Println("listening on :" + cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
