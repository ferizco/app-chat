package middleware

import (
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	httpx "github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/app/security"
)

type AuthConfig struct {
	Secret    string
	Blacklist *security.JTIBlacklist
}

func extractTokens(c *fiber.Ctx) []string {
	var toks []string
	if v := c.Cookies("auth_token"); v != "" {
		toks = append(toks, v)
	}
	if h := string(c.Request().Header.Peek("Authorization")); strings.HasPrefix(strings.ToLower(h), "bearer ") {
		toks = append(toks, strings.TrimSpace(h[7:]))
	}
	return toks
}

func AuthRequired(cfg AuthConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		cand := extractTokens(c)
		if len(cand) == 0 {
			// return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
			return httpx.Error(c, http.StatusUnauthorized, "missing token")
		}

		var lastErr error
		for _, tokenStr := range cand {
			tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				return []byte(cfg.Secret), nil
			})
			if err != nil || !tok.Valid {
				lastErr = fiber.NewError(http.StatusUnauthorized, "invalid token")
				continue
			}
			claims, ok := tok.Claims.(jwt.MapClaims)
			if !ok {
				lastErr = fiber.NewError(http.StatusUnauthorized, "invalid claims")
				continue
			}
			sub, _ := claims["sub"].(string)
			jti, _ := claims["jti"].(string)
			if sub == "" || jti == "" {
				lastErr = fiber.NewError(http.StatusUnauthorized, "invalid subject or jti")
				continue
			}
			// cek blacklist JTI
			if cfg.Blacklist != nil && cfg.Blacklist.Has(jti) {
				lastErr = fiber.NewError(http.StatusUnauthorized, "token revoked")
				continue
			}
			c.Locals("userID", sub)
			c.Locals("token", tokenStr)
			c.Locals("jti", jti)
			return c.Next()
		}
		if lastErr != nil {
			return lastErr
		}
		// return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		return httpx.Error(c, http.StatusUnauthorized, "unauthorized")
	}
}
