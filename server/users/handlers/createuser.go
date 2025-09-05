package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/helper"
	"github.com/ferizco/chat-app/server/users/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CreateUserHandler struct{ DB *gorm.DB }

func (h CreateUserHandler) Create(c *fiber.Ctx) error {
	// 1 Parse & sanitize input
	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Pass     string `json:"password"`
		IDAlias  string `json:"id_alias"`
	}
	if err := c.BodyParser(&body); err != nil {
		httpx.ErrorLogOnly(err, "CreateUserError")
		return httpx.Error(c, http.StatusBadRequest, "The data you sent is not in the correct format, please check your input.")
	}
	body.Name = strings.TrimSpace(body.Name)
	body.Username = strings.TrimSpace(body.Username)
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	// 2 Validasi minimal
	if strings.TrimSpace(body.Name) == "" {
		httpx.ErrorLogOnly(errors.New("name is null"), "validationError")
		return httpx.Error(c, http.StatusBadRequest, "name is required")
	}
	if strings.TrimSpace(body.Username) == "" {
		httpx.ErrorLogOnly(errors.New("username is null"), "validationError")
		return httpx.Error(c, http.StatusBadRequest, "username is required")
	}
	if strings.TrimSpace(body.Email) == "" {
		httpx.ErrorLogOnly(errors.New("email is null"), "validationError")
		return httpx.Error(c, http.StatusBadRequest, "email is required")
	}
	if strings.TrimSpace(body.Pass) == "" {
		httpx.ErrorLogOnly(errors.New("password is null"), "validationError")
		return httpx.Error(c, http.StatusBadRequest, "password is required")
	}
	if !helper.IsStrictEmail(body.Email) {
		httpx.ErrorLogOnly(errors.New("email is not valid"), "validationError")
		return httpx.Error(c, http.StatusBadRequest, "email must be a valid email address")
	}

	// Opsional validasi alias kalau diisi
	if body.IDAlias != "" {
		var exists int64
		if err := h.DB.Table("alias").Where("id_alias = ?", body.IDAlias).Count(&exists).Error; err != nil {
			httpx.ErrorLogOnly(err, "AliasError")
			return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
		}
		if exists == 0 {
			httpx.ErrorLogOnly(errors.New("id_alias not found"), "AliasError")
			return httpx.Error(c, http.StatusBadRequest, "Your Request Invalid")
		}
	}

	// 3 Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Pass), 12)
	if err != nil {
		httpx.ErrorLogOnly(err, "ValidationError")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	// 4 Insert user
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
			httpx.ErrorLogOnly(err, "ValidationError")
			return httpx.Error(c, http.StatusConflict, "Please use another email or username")
		}
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	// 5 Response
	var aliasName *string
	if u.IDAlias != "" {
		_ = h.DB.Table("alias").Select("alias_name").Where("id_alias = ?", u.IDAlias).Scan(&aliasName).Error
	}

	type UserDTO struct {
		// ID        string  `json:"id"` // ← otomatis 'u<seq>' dari DB
		Username  string  `json:"username"`
		Email     string  `json:"email"`
		AliasName *string `json:"alias_name,omitempty"`
		CreatedAt string  `json:"created_at"`
	}

	return httpx.Success(c, "User Created", UserDTO{
		// ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		AliasName: aliasName,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
	})
}
