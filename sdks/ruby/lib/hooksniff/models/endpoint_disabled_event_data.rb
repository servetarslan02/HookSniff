# frozen_string_literal: true
# This file is @generated
require "json"

module HookSniff
  # Sent when an endpoint has been automatically disabled after continuous failures, or manually via an API call.
  class EndpointDisabledEventData
    # The Application's ID.
    attr_accessor :app_id
    # The Application's UID.
    attr_accessor :app_uid
    # The Endpoint's ID.
    attr_accessor :endpoint_id
    # The Endpoint's UID.
    attr_accessor :endpoint_uid
    attr_accessor :fail_since
    attr_accessor :trigger

    ALL_FIELD ||= ["app_id", "app_uid", "endpoint_id", "endpoint_uid", "fail_since", "trigger"].freeze
    private_constant :ALL_FIELD

    def initialize(attributes = {})
      unless attributes.is_a?(Hash)
        fail(
          ArgumentError,
          "The input argument (attributes) must be a hash in `HookSniff::EndpointDisabledEventData` new method"
        )
      end

      attributes.each do |k, v|
        unless ALL_FIELD.include?(k.to_s)
          fail(ArgumentError, "The field #{k} is not part of HookSniff::EndpointDisabledEventData")
        end

        instance_variable_set("@#{k}", v)
        instance_variable_set("@__#{k}_is_defined", true)
      end
    end

    def self.deserialize(attributes = {})
      attributes = attributes.transform_keys(&:to_s)
      attrs = Hash.new
      attrs["app_id"] = attributes["appId"]
      attrs["app_uid"] = attributes["appUid"]
      attrs["endpoint_id"] = attributes["endpointId"]
      attrs["endpoint_uid"] = attributes["endpointUid"]
      attrs["fail_since"] = DateTime.rfc3339(attributes["failSince"]).to_time if attributes["failSince"]
      attrs["trigger"] = HookSniff::EndpointDisabledTrigger.deserialize(attributes["trigger"]) if attributes["trigger"]
      new(attrs)
    end

    def serialize
      out = Hash.new
      out["appId"] = HookSniff::serialize_primitive(@app_id) if @app_id
      out["appUid"] = HookSniff::serialize_primitive(@app_uid) if @app_uid
      out["endpointId"] = HookSniff::serialize_primitive(@endpoint_id) if @endpoint_id
      out["endpointUid"] = HookSniff::serialize_primitive(@endpoint_uid) if @endpoint_uid
      out["failSince"] = HookSniff::serialize_primitive(@fail_since) if @fail_since
      out["trigger"] = HookSniff::serialize_schema_ref(@trigger) if @trigger
      out
    end

    # Serializes the object to a json string
    # @return String
    def to_json
      JSON.dump(serialize)
    end
  end
end
