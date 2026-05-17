# frozen_string_literal: true

module HookSniff
  class HookSniffError < StandardError
    attr_reader :message

    def initialize(message = nil)
      @message = message
    end
  end

  class WebhookVerificationError < HookSniffError
  end

  class WebhookSigningError < HookSniffError
  end
end
