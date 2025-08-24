package logger

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

func AuthLogin(c *fiber.Ctx, userID, username string) {
	log.SetFlags(0)
	ip := c.IP()
	timestamp := time.Now().Format("15:04:05")

	// Format: waktu | status | ip | method | path | message
	log.Printf("%s | %s | auth:login | user_id=%s | username=%s | status=success",
		timestamp,
		ip,
		userID,
		username,
	)
}

func AuthLogout(c *fiber.Ctx, userID, username string) {
	ip := c.IP()
	log.Printf("[auth:logout] user_id=%s username=%s ip=%s status=success", userID, username, ip)
}
