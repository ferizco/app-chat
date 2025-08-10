package handlers

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/internal/models"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret string
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

	// bandingkan bcrypt hash (pass_hash di DB)
	if err := bcrypt.CompareHashAndPassword([]byte(u.PassHash), []byte(req.Password)); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}

	claims := jwt.MapClaims{
		"sub": u.ID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString([]byte(h.JWTSecret))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "sign token failed"})
	}

	// set cookie httpOnly agar otomatis terkirim (opsional, bisa juga pakai Authorization header)
	c.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    signed,
		HTTPOnly: true,
		SameSite: "Lax",
		Path:     "/",
		MaxAge:   24 * 3600,
	})

	return c.JSON(fiber.Map{
		"token": signed, // kalau mau pakai Authorization: Bearer
		"user":  fiber.Map{"id": u.ID, "username": u.Username},
	})
}
