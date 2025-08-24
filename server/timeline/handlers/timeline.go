package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/timeline/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// utility: ambil userID dari context (sesuaikan dg middleware JWT-mu)
func currentUserID(c *fiber.Ctx) (string, error) {
	if v := c.Locals("userID"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, nil
		}
	}
	return "", errors.New("unauthorized")
}

// --- adding post ----
type AddPostHandler struct{ DB *gorm.DB }

func (h AddPostHandler) Create(c *fiber.Ctx) error {
	uid, err := currentUserID(c)
	if err != nil {
		return httpx.Error(c, http.StatusUnauthorized, "login required")
	}

	// 1) Parse & sanitize input
	var body struct {
		Body string `json:"body"`
	}
	if err := c.BodyParser(&body); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid json body")
	}
	body.Body = strings.TrimSpace(body.Body)

	// 2) Validasi minimal
	if body.Body == "" {
		return httpx.Error(c, http.StatusBadRequest, "body cannot be empty")
	}

	// 3) Create
	post := models.Post{
		AuthorID: uid,
		Body:     body.Body,
	}
	if err := h.DB.Create(&post).Error; err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "db_error")
	}

	return httpx.Success(c, "post created", post)
}

// --- UPDATE ---
type EditPostHandler struct{ DB *gorm.DB }

func (h EditPostHandler) Update(c *fiber.Ctx) error {
	uid, err := currentUserID(c)
	if err != nil {
		return httpx.Error(c, http.StatusUnauthorized, "login required")
	}

	id := c.Params("id")
	var body struct {
		Body string `json:"body"`
	}
	if err := c.BodyParser(&body); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid json body")
	}
	body.Body = strings.TrimSpace(body.Body)
	if body.Body == "" {
		return httpx.Error(c, http.StatusBadRequest, "body cannot be empty")
	}

	var post models.Post
	if err := h.DB.Where("id = ? AND author_id = ? AND deleted_at IS NULL", id, uid).
		First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return httpx.Error(c, http.StatusNotFound, "post not found")
		}
		return httpx.Error(c, http.StatusInternalServerError, "db_error")
	}

	post.Body = body.Body
	post.UpdatedAt = time.Now()
	if err := h.DB.Save(&post).Error; err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "db_error")
	}

	return httpx.Success(c, "post updated", post)
}

// --- DELETE ---
type DeletePostHandler struct{ DB *gorm.DB }

func (h DeletePostHandler) Delete(c *fiber.Ctx) error {
	uid, err := currentUserID(c)
	if err != nil {
		return httpx.Error(c, http.StatusUnauthorized, "login required")
	}

	id := c.Params("id")
	tx := h.DB.Model(&models.Post{}).
		Where("id = ? AND author_id = ? AND deleted_at IS NULL", id, uid).
		Update("deleted_at", time.Now())
	if tx.Error != nil {
		return httpx.Error(c, http.StatusInternalServerError, "db_error")
	}
	if tx.RowsAffected == 0 {
		return httpx.Error(c, http.StatusNotFound, "post not found or already deleted")
	}

	return httpx.Success(c, "post deleted", nil)
}
