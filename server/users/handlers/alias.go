package handlers

import (
	"net/http"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/ferizco/chat-app/server/users/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AliasHandler struct{ DB *gorm.DB }

func (h AliasHandler) List_Alias(c *fiber.Ctx) error {

	var rows []models.Alias
	if err := h.DB.Find(&rows).Error; err != nil {
		httpx.ErrorLogOnly(err, "DB ERROR")
		return httpx.Error(c, http.StatusInternalServerError, "The server is currently unavailable")
	}

	type Alias struct {
		ID        string `json:"id_alias"`
		AliasName string `json:"alias_name"`
	}
	out := make([]Alias, 0, len(rows))
	for _, a := range rows {
		out = append(out, Alias{
			ID:        a.IDAlias,
			AliasName: a.AliasName,
		})
	}
	return httpx.Success(c, "fetched data", out)
}
