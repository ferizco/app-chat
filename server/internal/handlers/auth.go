package handlers

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/internal/models"
	"github.com/ferizco/chat-app/server/internal/security"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret string
	Blacklist *security.JTIBlacklist
}

type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h AuthHandler) Login(c *fiber.Ctx) error {
	var req loginReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "bad request"})
	}

	var u models.User
	if err := h.DB.Where("username = ?", req.Username).First(&u).Error; err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PassHash), []byte(req.Password)); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}

	claims := jwt.MapClaims{
		"sub": u.ID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"jti": uuid.NewString(), // token id unik
	}

	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString([]byte(h.JWTSecret))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "sign token failed"})
	}

	// Set cookie httpOnly
	c.Cookie(&fiber.Cookie{
		Name: "auth_token", Value: signed,
		HTTPOnly: true, SameSite: "Lax", Path: "/", MaxAge: 24 * 3600,
	})

	return c.JSON(fiber.Map{
		"token": signed,
		"user":  fiber.Map{"id": u.ID, "username": u.Username},
	})
}

// Logout: masukkan token ke blacklist sampai exp & hapus cookie.
func (h AuthHandler) Logout(c *fiber.Ctx) error {
	tokenStr, _ := c.Locals("token").(string)
	if tokenStr == "" {
		tokenStr = c.Cookies("auth_token")
		if tokenStr == "" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "no token"})
		}
	}
	tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.JWTSecret), nil
	})
	if err != nil || !tok.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
	}
	claims, _ := tok.Claims.(jwt.MapClaims)

	// Ambil jti & exp
	jti, _ := claims["jti"].(string)
	var until time.Time
	switch exp := claims["exp"].(type) {
	case float64:
		until = time.Unix(int64(exp), 0)
	case int64:
		until = time.Unix(exp, 0)
	default:
		until = time.Now().Add(24 * time.Hour)
	}

	// Blacklist JTI
	if h.Blacklist != nil {
		h.Blacklist.Add(jti, until)
	}

	// Hapus cookie
	c.Cookie(&fiber.Cookie{
		Name: "auth_token", Value: "",
		HTTPOnly: true, SameSite: "Lax", Path: "/", MaxAge: -1,
	})

	return c.JSON(fiber.Map{"message": "logged out"})
}
