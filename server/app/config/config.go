package config

import "os"

type Config struct {
	Port      string
	DSN       string
	JWTSecret string
	AppEnv    string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "2222"
	}

	// Default ke Postgres lokal (ubah sesuai lingkunganmu)
	// Format URL: postgres://user:pass@host:port/dbname?sslmode=disable
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "postgres://app_chat_user:app-chat@localhost:5432/app_chat?sslmode=disable"
	}

	sec := os.Getenv("JWT_SECRET")
	if sec == "" {
		sec = "dev-secret-change-me"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	return Config{
		Port:      port,
		DSN:       dsn,
		JWTSecret: sec,
		AppEnv:    env,
	}
}
