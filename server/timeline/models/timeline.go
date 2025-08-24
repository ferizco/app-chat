package models

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID           int64          `gorm:"primaryKey;column:id" json:"id"`
	AuthorID     string         `gorm:"column:author_id;not null" json:"author_id"`
	Body         string         `gorm:"column:body;not null" json:"body"`
	ParentPostID *int64         `gorm:"column:parent_post_id" json:"parent_post_id,omitempty"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Post) TableName() string { return "timeline_posts" }
