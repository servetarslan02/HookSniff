# frozen_string_literal: true

module HookSniff
  class Error < StandardError
    attr_reader :status_code, :error_code

    def initialize(message, status_code: nil, error_code: nil)
      super(message)
      @status_code = status_code
      @error_code = error_code
    end
  end

  class AuthenticationError < Error
    def initialize(message = "Unauthorized: invalid or missing API key")
      super(message, status_code: 401, error_code: "UNAUTHORIZED")
    end
  end

  class NotFoundError < Error
    def initialize(message = "Resource not found")
      super(message, status_code: 404, error_code: "NOT_FOUND")
    end
  end

  class RateLimitError < Error
    def initialize(message = "Rate limit exceeded")
      super(message, status_code: 429, error_code: "RATE_LIMIT_EXCEEDED")
    end
  end

  class ValidationError < Error
    def initialize(message = "Bad request")
      super(message, status_code: 400, error_code: "BAD_REQUEST")
    end
  end

  class PayloadTooLargeError < Error
    def initialize(message = "Payload too large")
      super(message, status_code: 413, error_code: "PAYLOAD_TOO_LARGE")
    end
  end
end
