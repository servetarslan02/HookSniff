package hooksniff

import (
	"fmt"
	"net/http"
)

// HookSniffError is the base error type for all HookSniff API errors.
type HookSniffError struct {
	StatusCode int
	Body       []byte
	Headers    http.Header
	Message    string
}

func (e *HookSniffError) Error() string {
	return fmt.Sprintf("HookSniff API error %d: %s", e.StatusCode, e.Message)
}

// BadRequestError represents a 400 Bad Request error.
type BadRequestError struct {
	HookSniffError
	Detail string
}

// UnauthorizedError represents a 401 Unauthorized error.
type UnauthorizedError struct {
	HookSniffError
}

// ForbiddenError represents a 403 Forbidden error.
type ForbiddenError struct {
	HookSniffError
}

// NotFoundError represents a 404 Not Found error.
type NotFoundError struct {
	HookSniffError
}

// ConflictError represents a 409 Conflict error.
type ConflictError struct {
	HookSniffError
}

// UnprocessableEntityError represents a 422 Unprocessable Entity error.
type UnprocessableEntityError struct {
	HookSniffError
	ValidationErrors []ValidationErrorItem
}

// ValidationErrorItem represents a single validation error.
type ValidationErrorItem struct {
	Loc  []string `json:"loc"`
	Msg  string   `json:"msg"`
	Type string   `json:"type"`
}

// RateLimitError represents a 429 Too Many Requests error.
type RateLimitError struct {
	HookSniffError
	RetryAfter *int
}

// InternalServerError represents a 500 Internal Server Error.
type InternalServerError struct {
	HookSniffError
}

// BadGatewayError represents a 502 Bad Gateway error.
type BadGatewayError struct {
	HookSniffError
}

// ServiceUnavailableError represents a 503 Service Unavailable error.
type ServiceUnavailableError struct {
	HookSniffError
}

// GatewayTimeoutError represents a 504 Gateway Timeout error.
type GatewayTimeoutError struct {
	HookSniffError
}

// CreateErrorFromStatus creates the appropriate error type from a status code.
func CreateErrorFromStatus(statusCode int, body []byte, headers http.Header) error {
	base := HookSniffError{
		StatusCode: statusCode,
		Body:       body,
		Headers:    headers,
		Message:    fmt.Sprintf("HTTP %d", statusCode),
	}

	switch statusCode {
	case 400:
		return &BadRequestError{HookSniffError: base}
	case 401:
		return &UnauthorizedError{HookSniffError: base}
	case 403:
		return &ForbiddenError{HookSniffError: base}
	case 404:
		return &NotFoundError{HookSniffError: base}
	case 409:
		return &ConflictError{HookSniffError: base}
	case 422:
		return &UnprocessableEntityError{HookSniffError: base}
	case 429:
		return &RateLimitError{HookSniffError: base}
	case 500:
		return &InternalServerError{HookSniffError: base}
	case 502:
		return &BadGatewayError{HookSniffError: base}
	case 503:
		return &ServiceUnavailableError{HookSniffError: base}
	case 504:
		return &GatewayTimeoutError{HookSniffError: base}
	default:
		return &base
	}
}
