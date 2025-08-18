package db

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Open(dsn string) *gorm.DB {
	// Contoh DSN:
	// postgres://postgres:postgres@localhost:5432/myapp_dev?sslmode=disable
	// atau:
	// host=localhost user=postgres password=postgres dbname=myapp_dev port=5432 sslmode=disable TimeZone=Asia/Jakarta

	d, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn), // atur sesuai kebutuhan dev/prod
	})
	if err != nil {
		log.Fatalf("failed to open DB: %v", err)
	}

	sqlDB, err := d.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	// Pooling yang masuk akal untuk dev
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(1 * time.Hour)

	// Pastikan koneksi hidup
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("failed to ping DB: %v", err)
	}

	return d
}
