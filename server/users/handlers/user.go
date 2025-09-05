package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
)

type UserHandler struct{ DB *gorm.DB }

func (h UserHandler) List(c *fiber.Ctx) error {
	selfID, _ := c.Locals("userID").(string)

	var users []models.User
	tx := h.DB.Preload("Alias")

	if selfID != "" {
		tx = tx.Where("id <> ?", selfID)
	}
	if err := tx.Order("created_at desc").Find(&users).Error; err != nil {
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	type UserDTO struct {
		ID        string `json:"id"`
		Username  string `json:"username"`
		AliasName string `json:"alias_name"`
	}
	out := make([]UserDTO, 0, len(users))
	for _, u := range users {
		out = append(out, UserDTO{
			ID:        u.ID,
			Username:  u.Username,
			AliasName: u.Alias.AliasName,
		})
	}
	return httpx.Success(c, "fetched data", out)
}

func (h UserHandler) Profile(c *fiber.Ctx) error {
	selfID, _ := c.Locals("userID").(string)
	if selfID == "" {
		httpx.ErrorLogOnly(errors.New("userid null"), "ProfileError")
		return httpx.Error(c, fiber.StatusUnauthorized, "You Are Unauthorized")
	}

	var u models.User
	if err := h.DB.
		Preload("Alias").
		Where("id = ?", selfID).
		Take(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.ErrorLogOnly(err, "ProfileError")
			return httpx.Error(c, fiber.StatusNotFound, "Your request invalid")
		}
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, fiber.StatusInternalServerError, "The server is currently unavailable")
	}

	type UserDTO struct {
		Name      string `json:"name"`
		Email     string `json:"email"`
		Username  string `json:"username"`
		AliasName string `json:"alias_name"`
		CreatedAt string `json:"created_at"`
	}

	out := UserDTO{
		Name:      u.Name,
		Email:     u.Email,
		Username:  u.Username,
		AliasName: u.Alias.AliasName, // kosong jika user tak punya alias
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
	}

	return httpx.Success(c, "fetched profile", out)
}
