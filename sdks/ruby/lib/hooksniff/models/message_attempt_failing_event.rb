# frozen_string_literal: true
# This file is @generated
require "json"

module HookSniff
  # Sent after a message has been failing for a few times.
  # It's sent on the fourth failure. It complements `message.attempt.exhausted` which is sent after the last failure.
  class MessageAttemptFailingEvent
    attr_accessor :data
    attr_accessor :type

    ALL_FIELD ||= ["data", "type"].freeze
    private_constant :ALL_FIELD

    def initialize(attributes = {})
      unless attributes.is_a?(Hash)
        fail(
          ArgumentError,
          "The input argument (attributes) must be a hash in `HookSniff::MessageAttemptFailingEvent` new method"
        )
      end

      attributes.each do |k, v|
        unless ALL_FIELD.include?(k.to_s)
          fail(ArgumentError, "The field #{k} is not part of HookSniff::MessageAttemptFailingEvent")
        end

        instance_variable_set("@#{k}", v)
        instance_variable_set("@__#{k}_is_defined", true)
      end
    end

    def self.deserialize(attributes = {})
      attributes = attributes.transform_keys(&:to_s)
      attrs = Hash.new
      attrs["data"] = HookSniff::MessageAttemptFailingEventData.deserialize(attributes["data"])
      attrs["type"] = attributes["type"]
      new(attrs)
    end

    def serialize
      out = Hash.new
      out["data"] = HookSniff::serialize_schema_ref(@data) if @data
      out["type"] = HookSniff::serialize_primitive(@type) if @type
      out
    end

    # Serializes the object to a json string
    # @return String
    def to_json
      JSON.dump(serialize)
    end
  end
end
