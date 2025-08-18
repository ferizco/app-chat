package db

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

//go:embed seed/*.sql
var seedFS embed.FS

func Seed(dsn string) {
	sqlBytes, err := seedFS.ReadFile("seed/dev_seed.sql")
	if err != nil {
		log.Fatalf("read seed: %v", err)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("open db for seed: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if _, err := db.ExecContext(ctx, string(sqlBytes)); err != nil {
		log.Fatalf("apply seed: %v", err)
	}

	fmt.Println("🌱 seed applied")
}
