# frozen_string_literal: true

require "json"
require "net/http"
require "uri"
require "openssl"

require_relative "hooksniff/version"
require_relative "hooksniff/errors"
require_relative "hooksniff/client"
require_relative "hooksniff/verification"

module HookSniff
  # Default API base URL
  DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"

  # Default request timeout in seconds
  DEFAULT_TIMEOUT = 30
end
