package config

import "os"

type Config struct {
	Port      string
	DSN       string
	JWTSecret string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "2222"
	}
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "app.db"
	}
	sec := os.Getenv("JWT_SECRET")
	if sec == "" {
		sec = "dev-secret-change-me"
	}

	return Config{
		Port:      port,
		DSN:       dsn,
		JWTSecret: sec,
	}
}
