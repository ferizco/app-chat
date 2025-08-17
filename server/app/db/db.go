package db

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func Open(dsn string) *gorm.DB {
	d, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	return d
}
