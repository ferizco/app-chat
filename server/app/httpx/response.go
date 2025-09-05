package httpx

import (
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type Response struct {
	Status  string      `json:"status"`            // "success" | "error"
	Message string      `json:"message,omitempty"` // pesan singkat
	Data    interface{} `json:"data,omitempty"`    // payload (bisa object/array/null)
}

func Success(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(http.StatusOK).JSON(Response{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

func Error(c *fiber.Ctx, httpStatus int, message string) error {
	return c.Status(httpStatus).JSON(Response{
		Status:  "error",
		Message: message,
	})
}

// ErrorLogOnly → cuma untuk log
func ErrorLogOnly(err error, context string) {
	if err != nil {
		log.Printf("[ERROR] %s: %v", context, err)
	}
}
