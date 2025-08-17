package models

import "time"

type Alias struct {
	IDAlias   string `gorm:"primaryKey"`
	AliasName string `gorm:"not null"`
}

type User struct {
	ID        string `gorm:"primaryKey"`
	Username  string `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time
	PassHash  string `gorm:"not null;default:''"`
	Name      string `gorm:"not null;default:''"`
	Email     string `gorm:"uniqueIndex;not null"`
	IDAlias   string `gorm:"index"`
	Alias     Alias  `gorm:"foreignKey:IDAlias;references:IDAlias"`
}

// pastikan GORM tidak pluralize ke "aliases"
func (Alias) TableName() string { return "alias" }
