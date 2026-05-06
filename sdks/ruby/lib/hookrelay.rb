# frozen_string_literal: true

require "json"
require "net/http"
require "uri"
require "openssl"

require_relative "hookrelay/version"
require_relative "hookrelay/errors"
require_relative "hookrelay/client"
require_relative "hookrelay/verification"

module HookRelay
  # Default API base URL
  DEFAULT_BASE_URL = "https://api.hookrelay.io/v1"

  # Default request timeout in seconds
  DEFAULT_TIMEOUT = 30
end
