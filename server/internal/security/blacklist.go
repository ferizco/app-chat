package security

import (
	"log"
	"sync"
	"time"
)

type JTIBlacklist struct {
	mu   sync.RWMutex
	data map[string]time.Time // key: jti, val: expireAt
	stop chan struct{}
}

func NewJTIBlacklist() *JTIBlacklist {
	b := &JTIBlacklist{
		data: make(map[string]time.Time),
		stop: make(chan struct{}),
	}
	go b.cleaner()
	return b
}

func (b *JTIBlacklist) Add(jti string, until time.Time) {
	if jti == "" {
		return
	}
	b.mu.Lock()
	b.data[jti] = until
	b.mu.Unlock()
}

func (b *JTIBlacklist) Has(jti string) bool {
	if jti == "" {
		return false
	}
	now := time.Now()
	b.mu.RLock()
	exp, ok := b.data[jti]
	b.mu.RUnlock()
	hit := ok && now.Before(exp)
	return hit
}

type Entry struct {
	JTI      string    `json:"jti"`
	ExpireAt time.Time `json:"expire_at"`
}

func (b *JTIBlacklist) Snapshot() []Entry {
	b.mu.RLock()
	defer b.mu.RUnlock()
	out := make([]Entry, 0, len(b.data))
	for j, exp := range b.data {
		out = append(out, Entry{JTI: j, ExpireAt: exp})
	}
	return out
}

func (b *JTIBlacklist) Stop() { close(b.stop) }

func (b *JTIBlacklist) cleaner() {
	t := time.NewTicker(1 * time.Minute)
	defer t.Stop()
	for {
		select {
		case <-b.stop:
			return
		case <-t.C:
			now := time.Now()
			b.mu.Lock()
			for j, exp := range b.data {
				if now.After(exp) {
					log.Printf("[blacklist:gc] removing jti=%s (expired %s)", j, exp.UTC().Format(time.RFC3339))
					delete(b.data, j)
				}
			}
			b.mu.Unlock()
		}
	}
}
