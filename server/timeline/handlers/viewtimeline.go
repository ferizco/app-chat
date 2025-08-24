package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/ferizco/chat-app/server/app/httpx"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// Response DTO
type TimelineItem struct {
	ID        int64     `json:"id"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
	AuthorID  string    `json:"author_id"`
	AliasName *string   `json:"alias_name,omitempty"`
}

// Query object untuk scan hasil join
type timelineRow struct {
	ID        int64
	Body      string
	CreatedAt time.Time
	AuthorID  string
	AliasName *string
}

type ViewTimelineHandler struct{ DB *gorm.DB }

// GET /api/v1/timeline?limit=20&offset=0
func (h ViewTimelineHandler) List(c *fiber.Ctx) error {
	// pagination simple
	limit := 20
	offset := 0
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}
	if v := c.Query("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}

	var rows []timelineRow
	// hanya post utama (parent_post_id IS NULL), dan belum dihapus
	// join users & alias untuk ambil username + alias_name
	err := h.DB.
		Raw(`
			SELECT
				p.id,
				p.body,
				p.created_at,
				u.id        AS author_id,
				a.alias_name AS alias_name
			FROM timeline_posts p
			JOIN users u       ON u.id = p.author_id
			LEFT JOIN alias a  ON a.id_alias = u.id_alias
			WHERE p.deleted_at IS NULL
			  AND p.parent_post_id IS NULL
			ORDER BY p.created_at DESC, p.id DESC
			LIMIT ? OFFSET ?`, limit, offset).
		Scan(&rows).Error
	if err != nil {
		return httpx.Error(c, http.StatusInternalServerError, "db_error")
	}

	items := make([]TimelineItem, 0, len(rows))
	for _, r := range rows {
		items = append(items, TimelineItem{
			ID:        r.ID,
			Body:      r.Body,
			CreatedAt: r.CreatedAt,
			AuthorID:  r.AuthorID,
			AliasName: r.AliasName,
		})
	}

	return httpx.Success(c, "ok", fiber.Map{
		"items": items,
		"paging": fiber.Map{
			"limit":  limit,
			"offset": offset,
			"count":  len(items),
		},
	})
}
