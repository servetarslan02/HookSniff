# frozen_string_literal: true

module HookSniff
  class HttpErrorOut
    attr_accessor :code

    attr_accessor :detail

    def initialize(attributes = {})
      if (!attributes.is_a?(Hash))
        fail(ArgumentError, "The input argument (attributes) must be a hash in `HookSniff::HttpErrorOut` initialize method")
      end

      @detail = attributes[:"detail"]
      @code = attributes[:"code"]
    end
  end
end
