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
		return httpx.Error(c, http.StatusUnauthorized, "unauthorized")
	}

	var body struct {
		OldPass     string `json:"old_pass"`
		NewPass     string `json:"new_pass"`
		ConfirmPass string `json:"confirm_pass"` // opsional
	}
	if err := c.BodyParser(&body); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid json body")
	}

	body.OldPass = strings.TrimSpace(body.OldPass)
	body.NewPass = strings.TrimSpace(body.NewPass)
	body.ConfirmPass = strings.TrimSpace(body.ConfirmPass)

	// Validasi dasar
	if body.OldPass == "" || body.NewPass == "" {
		return httpx.Error(c, http.StatusBadRequest, "old_pass and new_pass are required")
	}
	if body.ConfirmPass != "" && body.NewPass != body.ConfirmPass {
		return httpx.Error(c, http.StatusBadRequest, "new_pass and confirm_pass do not match")
	}
	if len(body.NewPass) < 6 {
		return httpx.Error(c, http.StatusBadRequest, "new_pass must be at least 8 characters")
	}
	if body.NewPass == body.OldPass {
		return httpx.Error(c, http.StatusBadRequest, "new_pass must be different from old_pass")
	}

	// Ambil user
	var u models.User
	if err := h.DB.Where("id = ?", selfID).Take(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return httpx.Error(c, http.StatusNotFound, "user not found")
		}
		return httpx.Error(c, http.StatusInternalServerError, "DB ERROR")
	}

	// Verifikasi old_pass
	if err := bcrypt.CompareHashAndPassword([]byte(u.PassHash), []byte(body.OldPass)); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "old_pass is incorrect")
	}

	// Hash new_pass (cost 12 agar konsisten)
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.NewPass), 12)
	if err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "failed to hash password")
	}

	// Update dalam transaksi
	tx := h.DB.Begin()
	if tx.Error != nil {
		return httpx.Error(c, http.StatusInternalServerError, "cannot start transaction")
	}
	if err := tx.Model(&models.User{}).
		Where("id = ?", selfID).
		Update("pass_hash", string(hashed)).Error; err != nil {
		tx.Rollback()
		return httpx.Error(c, http.StatusInternalServerError, "DB ERROR (update pass)")
	}
	if err := tx.Commit().Error; err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "DB ERROR (commit)")
	}

	return httpx.Success(c, "password changed", nil)
}
