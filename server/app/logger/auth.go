package logger

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func AuthLogin(c *fiber.Ctx, userID, username string) {
	ip := c.IP()
	log.Printf("[auth:login] user_id=%s username=%s ip=%s status=success", userID, username, ip)
}

func AuthLogout(c *fiber.Ctx, userID, username string) {
	ip := c.IP()
	log.Printf("[auth:logout] user_id=%s username=%s ip=%s status=success", userID, username, ip)
}
