package handlers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
)

type UserHandler struct{ DB *gorm.DB }

// GET /api/users (protected)
func (h UserHandler) List(c *fiber.Ctx) error {
	selfID, _ := c.Locals("userID").(string)

	var users []models.User
	tx := h.DB
	if selfID != "" {
		tx = tx.Where("id <> ?", selfID)
	}
	if err := tx.Order("created_at desc").Find(&users).Error; err != nil {
		// return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "db error"})
		return httpx.Error(c, http.StatusInternalServerError, "DB ERROR")
	}

	type UserDTO struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}
	out := make([]UserDTO, 0, len(users))
	for _, u := range users {
		out = append(out, UserDTO{ID: u.ID, Username: u.Username})
	}
	return httpx.Success(c, "fetched data", out)
}
