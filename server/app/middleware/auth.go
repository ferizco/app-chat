package middleware

import (
	"errors"
	"fmt"
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
			httpx.ErrorLogOnly(errors.New("no token found"), "auth middleware")
			return httpx.Error(c, http.StatusUnauthorized, "Please login first")
		}

		var lastErr error
		for _, tokenStr := range cand {
			tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				// harden: pastikan algoritma sesuai
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(cfg.Secret), nil
			})
			if err != nil || !tok.Valid {
				if err == nil {
					err = errors.New("token invalid")
				}
				lastErr = fmt.Errorf("parse token failed: %w", err)
				continue
			}

			claims, ok := tok.Claims.(jwt.MapClaims)
			if !ok {
				lastErr = errors.New("invalid claims type")
				continue
			}

			sub, _ := claims["sub"].(string)
			jti, _ := claims["jti"].(string)
			if sub == "" || jti == "" {
				lastErr = errors.New("missing sub or jti")
				continue
			}

			// cek blacklist JTI
			if cfg.Blacklist != nil && cfg.Blacklist.Has(jti) {
				lastErr = errors.New("token revoked")
				continue
			}
			c.Locals("userID", sub)
			c.Locals("token", tokenStr)
			c.Locals("jti", jti)
			return c.Next()
		}
		if lastErr != nil {
			httpx.ErrorLogOnly(lastErr, "auth middleware")
		}
		return httpx.Error(c, http.StatusUnauthorized, "You Are Unauthorized")
	}
}
