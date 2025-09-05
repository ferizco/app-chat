package helper

import (
	"net/mail"
	"regexp"
	"strings"
)

var emailStrictRe = regexp.MustCompile(`^[A-Za-z0-9._+]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$`)

func IsStrictEmail(s string) bool {
	s = strings.TrimSpace(s)
	if s == "" {
		return false
	}

	// 1) Validasi RFC dasar + tolak "Nama <email@host>"
	addr, err := mail.ParseAddress(s)
	if err != nil || addr.Address != s {
		return false
	}

	// 2) Cocokkan regex ketat
	if !emailStrictRe.MatchString(s) {
		return false
	}

	// 3) Cek tambahan: tidak boleh titik di awal/akhir local-part & tidak boleh dua titik berurutan
	at := strings.IndexByte(s, '@')
	local := s[:at]
	if strings.HasPrefix(local, ".") || strings.HasSuffix(local, ".") || strings.Contains(local, "..") {
		return false
	}
	return true
}
