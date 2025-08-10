package middleware

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthConfig struct{ Secret string }

func AuthRequired(cfg AuthConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Ambil token dari Authorization: Bearer ... atau cookie "auth_token"
		var tokenStr string
		if h := string(c.Request().Header.Peek("Authorization")); strings.HasPrefix(strings.ToLower(h), "bearer ") {
			tokenStr = strings.TrimSpace(h[7:])
		}
		if tokenStr == "" {
			if v := c.Cookies("auth_token"); v != "" {
				tokenStr = v
			}
		}
		if tokenStr == "" {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}

		tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.Secret), nil
		})
		if err != nil || !tok.Valid {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		claims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid claims"})
		}
		sub, _ := claims["sub"].(string)
		if sub == "" {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid subject"})
		}

		c.Locals("userID", sub)
		return c.Next()
	}
}
