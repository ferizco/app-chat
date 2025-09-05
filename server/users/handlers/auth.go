package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/app/logger"
	"github.com/ferizco/chat-app/server/app/security"
	"github.com/ferizco/chat-app/server/users/models"
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
		httpx.ErrorLogOnly(err, "loginError")
		return httpx.Error(c, http.StatusBadRequest, "The data you sent is not in the correct format, please check your input.")
	}

	var u models.User
	if err := h.DB.Where("username = ?", req.Username).First(&u).Error; err != nil {
		httpx.ErrorLogOnly(err, "username incorrect")
		return httpx.Error(c, http.StatusUnauthorized, "The username or password you entered is incorrect.")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PassHash), []byte(req.Password)); err != nil {
		httpx.ErrorLogOnly(err, "password incorect")
		return httpx.Error(c, http.StatusUnauthorized, "The username or password you entered is incorrect.")
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
		httpx.ErrorLogOnly(err, "failed to sign JWT token")
		return httpx.Error(c, http.StatusInternalServerError, "We couldn’t complete your login. Please try again later.")
	}

	// Set cookie httpOnly
	c.Cookie(&fiber.Cookie{
		Name: "auth_token", Value: signed,
		HTTPOnly: true, SameSite: "Lax", Path: "/", MaxAge: 24 * 3600,
	})

	logger.AuthLogin(c, u.ID, u.Username)

	return httpx.Success(c, "login success", fiber.Map{
		"token": signed,
		"user":  fiber.Map{"id": u.ID, "username": u.Username},
	})

}

// Logout: masukkan token ke blacklist sampai exp & hapus cookie.
func (h AuthHandler) Logout(c *fiber.Ctx) error {
	tokenStr, _ := c.Locals("token").(string)
	if tokenStr == "" {
		tokenStr = c.Cookies("auth_token")
	}
	if tokenStr == "" {
		httpx.ErrorLogOnly(errors.New("no token found"), "logout")
		return httpx.Error(c, http.StatusBadRequest, "Request not valid")
	}

	tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.JWTSecret), nil
	})
	if err != nil || !tok.Valid {
		httpx.ErrorLogOnly(err, "invalid error")
		return httpx.Error(c, http.StatusUnauthorized, "You are Unauthorized")
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

	return httpx.Success(c, "logged out", nil)
}
