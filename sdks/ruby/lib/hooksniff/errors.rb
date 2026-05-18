# frozen_string_literal: true

module HookSniff
  # Base error class for all HookSniff API errors
  class ApiError < StandardError
    attr_reader :code, :response_headers, :response_body

    def initialize(code:, response_headers: {}, response_body: nil)
      @code = code
      @response_headers = response_headers
      @response_body = response_body
      super("HookSniff API error #{code}")
    end
  end

  # 400 Bad Request
  class BadRequestError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 400, response_headers: response_headers, response_body: response_body)
    end
  end

  # 401 Unauthorized
  class UnauthorizedError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 401, response_headers: response_headers, response_body: response_body)
    end
  end

  # 403 Forbidden
  class ForbiddenError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 403, response_headers: response_headers, response_body: response_body)
    end
  end

  # 404 Not Found
  class NotFoundError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 404, response_headers: response_headers, response_body: response_body)
    end
  end

  # 409 Conflict
  class ConflictError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 409, response_headers: response_headers, response_body: response_body)
    end
  end

  # 422 Unprocessable Entity
  class UnprocessableEntityError < ApiError
    attr_reader :validation_errors

    def initialize(validation_errors: [], response_headers: {}, response_body: nil)
      super(code: 422, response_headers: response_headers, response_body: response_body)
      @validation_errors = validation_errors
    end
  end

  # 429 Rate Limited
  class RateLimitError < ApiError
    attr_reader :retry_after

    def initialize(retry_after: nil, response_headers: {}, response_body: nil)
      super(code: 429, response_headers: response_headers, response_body: response_body)
      @retry_after = retry_after
    end
  end

  # 500 Internal Server Error
  class InternalServerError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 500, response_headers: response_headers, response_body: response_body)
    end
  end

  # 502 Bad Gateway
  class BadGatewayError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 502, response_headers: response_headers, response_body: response_body)
    end
  end

  # 503 Service Unavailable
  class ServiceUnavailableError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 503, response_headers: response_headers, response_body: response_body)
    end
  end

  # 504 Gateway Timeout
  class GatewayTimeoutError < ApiError
    def initialize(response_headers: {}, response_body: nil)
      super(code: 504, response_headers: response_headers, response_body: response_body)
    end
  end

  # Create the appropriate error from a status code
  def self.create_error_from_status(status_code, response_headers: {}, response_body: nil)
    case status_code
    when 400
      BadRequestError.new(response_headers: response_headers, response_body: response_body)
    when 401
      UnauthorizedError.new(response_headers: response_headers, response_body: response_body)
    when 403
      ForbiddenError.new(response_headers: response_headers, response_body: response_body)
    when 404
      NotFoundError.new(response_headers: response_headers, response_body: response_body)
    when 409
      ConflictError.new(response_headers: response_headers, response_body: response_body)
    when 422
      UnprocessableEntityError.new(response_headers: response_headers, response_body: response_body)
    when 429
      retry_after = response_headers["retry-after"]&.to_i
      RateLimitError.new(retry_after: retry_after, response_headers: response_headers, response_body: response_body)
    when 500
      InternalServerError.new(response_headers: response_headers, response_body: response_body)
    when 502
      BadGatewayError.new(response_headers: response_headers, response_body: response_body)
    when 503
      ServiceUnavailableError.new(response_headers: response_headers, response_body: response_body)
    when 504
      GatewayTimeoutError.new(response_headers: response_headers, response_body: response_body)
    else
      ApiError.new(code: status_code, response_headers: response_headers, response_body: response_body)
    end
  end
end
