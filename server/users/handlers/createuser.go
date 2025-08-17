// handlers/user_create.go
package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type CreateUserHandler struct{ DB *gorm.DB }

func (h CreateUserHandler) Create(c *fiber.Ctx) error {
	// 1) Parse & sanitize input
	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Pass     string `json:"pass"`
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
		return httpx.Error(c, http.StatusBadRequest, "name/username/email/pass is required")
	}

	// 3) Mulai transaksi (biar konsisten)
	tx := h.DB.Begin()
	if tx.Error != nil {
		return httpx.Error(c, http.StatusInternalServerError, "cannot start transaction")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 4) Email harus unik
	var cnt int64
	if err := tx.Table("users").Where("email = ?", body.Email).Count(&cnt).Error; err != nil {
		tx.Rollback()
		return httpx.Error(c, http.StatusInternalServerError, "db error (email check)")
	}
	if cnt > 0 {
		tx.Rollback()
		return httpx.Error(c, http.StatusConflict, "email already used")
	}

	// (Opsional) validasi alias kalau diisi
	if body.IDAlias != "" {
		var ok int64
		if err := tx.Table("alias").Where("id_alias = ?", body.IDAlias).Count(&ok).Error; err != nil {
			tx.Rollback()
			return httpx.Error(c, http.StatusInternalServerError, "db error (alias check)")
		}
		if ok == 0 {
			tx.Rollback()
			return httpx.Error(c, http.StatusBadRequest, "id_alias not found")
		}
	}

	// 5) Generate ID berurutan: u1, u2, ...
	var nextNum int64
	if err := tx.
		Raw(`SELECT COALESCE(MAX(CAST(SUBSTR(id, 2) AS INTEGER)), 0) + 1 FROM users`).
		Scan(&nextNum).Error; err != nil {
		tx.Rollback()
		return httpx.Error(c, http.StatusInternalServerError, "db error (next id)")
	}
	newID := fmt.Sprintf("u%d", nextNum)

	// 6) Hash password (cost 12 agar konsisten dgn sample kamu)
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Pass), 12)
	if err != nil {
		tx.Rollback()
		return httpx.Error(c, http.StatusInternalServerError, "failed to hash password")
	}

	// 7) Insert user
	u := models.User{
		ID:        newID,
		Username:  body.Username,
		CreatedAt: time.Now(),
		PassHash:  string(hashed),
		Name:      body.Name,
		Email:     body.Email,
		IDAlias:   body.IDAlias, // bisa kosong
	}
	if err := tx.Create(&u).Error; err != nil {
		tx.Rollback()
		// kalau ada unique constraint lain (username/email), bisa muncul di sini juga
		return httpx.Error(c, http.StatusInternalServerError, "db error (create user)")
	}

	// 8) Commit
	if err := tx.Commit().Error; err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "db error (commit)")
	}

	// 9) Response (opsional: include alias_name)
	var aliasName string
	if u.IDAlias != "" {
		_ = h.DB.Table("alias").Select("alias_name").Where("id_alias = ?", u.IDAlias).Scan(&aliasName).Error
	}

	type UserDTO struct {
		ID        string `json:"id"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		AliasName string `json:"alias_name,omitempty"`
		CreatedAt string `json:"created_at"`
	}
	return httpx.Success(c, "created", UserDTO{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		AliasName: aliasName,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
	})
}
