// handlers/user_create.go
package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CreateUserHandler struct{ DB *gorm.DB }

func (h CreateUserHandler) Create(c *fiber.Ctx) error {
	// 1) Parse & sanitize input
	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Pass     string `json:"password"`
		IDAlias  string `json:"id_alias"`
	}
	if err := c.BodyParser(&body); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid json body")
	}
	body.Name = strings.TrimSpace(body.Name)
	body.Username = strings.TrimSpace(body.Username)
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	// 2) Validasi minimal
	if body.Name == "" || body.Username == "" || body.Email == "" || body.Pass == "" {
		return httpx.Error(c, http.StatusBadRequest, "name/username/email/password is required")
	}

	// (Opsional) validasi alias kalau diisi
	if body.IDAlias != "" {
		var exists int64
		if err := h.DB.Table("alias").Where("id_alias = ?", body.IDAlias).Count(&exists).Error; err != nil {
			return httpx.Error(c, http.StatusInternalServerError, "db error (alias check)")
		}
		if exists == 0 {
			return httpx.Error(c, http.StatusBadRequest, "id_alias not found")
		}
	}

	// 3) Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Pass), 12)
	if err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "failed to hash password")
	}

	// 4) Insert user — JANGAN set u.ID (biarkan DB generate 'u<seq>')
	u := models.User{
		// ID: "",  // kosongkan
		Username:  body.Username,
		CreatedAt: time.Now(),
		PassHash:  string(hashed),
		Name:      body.Name,
		Email:     body.Email,
		IDAlias:   body.IDAlias,
	}

	if err := h.DB.
		Clauses(clause.Returning{}). // <- ini penting biar ID diisi balik
		Create(&u).Error; err != nil {

		if strings.Contains(err.Error(), "duplicate key value") {
			return httpx.Error(c, http.StatusConflict, "username or email already used")
		}
		return httpx.Error(c, http.StatusInternalServerError, "db error (create user)")
	}

	// 5) Response (opsional: sertakan alias_name)
	var aliasName *string
	if u.IDAlias != "" {
		_ = h.DB.Table("alias").Select("alias_name").Where("id_alias = ?", u.IDAlias).Scan(&aliasName).Error
	}

	type UserDTO struct {
		ID        string  `json:"id"` // ← otomatis 'u<seq>' dari DB
		Username  string  `json:"username"`
		Email     string  `json:"email"`
		AliasName *string `json:"alias_name,omitempty"`
		CreatedAt string  `json:"created_at"`
	}

	return httpx.Success(c, "created", UserDTO{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		AliasName: aliasName,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
	})
}
