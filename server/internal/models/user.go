package models

import "time"

type User struct {
	ID        string `gorm:"primaryKey"`
	Username  string `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time
	PassHash  string `gorm:"not null;default:''"`
}
