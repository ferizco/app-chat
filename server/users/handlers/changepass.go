// handlers/user_change_password.go
package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type ChangePassHandler struct{ DB *gorm.DB }

func (h ChangePassHandler) ChangePassword(c *fiber.Ctx) error {
	selfID, _ := c.Locals("userID").(string)
	if selfID == "" {
		httpx.ErrorLogOnly(errors.New("user id null"), "ChangePassError")
		return httpx.Error(c, http.StatusUnauthorized, "You Are Unauthorized")
	}

	var body struct {
		OldPass     string `json:"old_pass"`
		NewPass     string `json:"new_pass"`
		ConfirmPass string `json:"confirm_pass"` // opsional
	}
	if err := c.BodyParser(&body); err != nil {
		httpx.ErrorLogOnly(err, "ChangePassError")
		return httpx.Error(c, http.StatusBadRequest, "Your Request invalid")
	}

	body.OldPass = strings.TrimSpace(body.OldPass)
	body.NewPass = strings.TrimSpace(body.NewPass)
	body.ConfirmPass = strings.TrimSpace(body.ConfirmPass)

	// Validasi dasar
	if body.OldPass == "" || body.NewPass == "" {
		httpx.ErrorLogOnly(errors.New("Oldpass & NewPass null"), "ValidationError")
		return httpx.Error(c, http.StatusBadRequest, "old password and new password are required")
	}
	if body.ConfirmPass != "" && body.NewPass != body.ConfirmPass {
		httpx.ErrorLogOnly(errors.New("new_pass and confirm_pass do not match"), "ValidationError")
		return httpx.Error(c, http.StatusBadRequest, "new password and confirm password do not match")
	}
	if len(body.NewPass) < 6 {
		httpx.ErrorLogOnly(errors.New("pass less than 6"), "ValidationError")
		return httpx.Error(c, http.StatusBadRequest, "new password must be at least 8 characters")
	}
	if body.NewPass == body.OldPass {
		httpx.ErrorLogOnly(errors.New("Oldpass & NewPass is same"), "ValidationError")
		return httpx.Error(c, http.StatusBadRequest, "new password must be different from old password")
	}

	// Ambil user
	var u models.User
	if err := h.DB.Where("id = ?", selfID).Take(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.ErrorLogOnly(err, "user not found")
			return httpx.Error(c, http.StatusNotFound, "Your Request invalid")
		}
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	// Verifikasi old_pass
	if err := bcrypt.CompareHashAndPassword([]byte(u.PassHash), []byte(body.OldPass)); err != nil {
		httpx.ErrorLogOnly(err, "ComparepassError")
		return httpx.Error(c, http.StatusBadRequest, "old password is incorrect")
	}

	// Hash new_pass (cost 12 agar konsisten)
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.NewPass), 12)
	if err != nil {
		httpx.ErrorLogOnly(err, "hashError")
		return httpx.Error(c, http.StatusInternalServerError, "Your Request invalid")
	}

	// Update dalam transaksi
	tx := h.DB.Begin()
	if tx.Error != nil {
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}
	if err := tx.Model(&models.User{}).
		Where("id = ?", selfID).
		Update("pass_hash", string(hashed)).Error; err != nil {
		tx.Rollback()
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}
	if err := tx.Commit().Error; err != nil {
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	return httpx.Success(c, "password changed", nil)
}
