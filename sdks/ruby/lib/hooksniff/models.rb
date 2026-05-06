# frozen_string_literal: true

module HookSniff
  module Models
    class Endpoint
      attr_reader :id, :url, :description, :is_active, :retry_policy, :created_at

      def initialize(data)
        @id = data["id"]
        @url = data["url"]
        @description = data["description"]
        @is_active = data["is_active"]
        @retry_policy = data["retry_policy"] ? RetryPolicy.new(data["retry_policy"]) : nil
        @created_at = data["created_at"]
      end

      def to_h
        {
          id: @id,
          url: @url,
          description: @description,
          is_active: @is_active,
          retry_policy: @retry_policy&.to_h,
          created_at: @created_at
        }
      end
    end

    class RetryPolicy
      attr_reader :max_attempts, :backoff, :initial_delay_secs, :max_delay_secs

      def initialize(data)
        @max_attempts = data["max_attempts"]
        @backoff = data["backoff"]
        @initial_delay_secs = data["initial_delay_secs"]
        @max_delay_secs = data["max_delay_secs"]
      end

      def to_h
        {
          max_attempts: @max_attempts,
          backoff: @backoff,
          initial_delay_secs: @initial_delay_secs,
          max_delay_secs: @max_delay_secs
        }.compact
      end
    end

    class Delivery
      attr_reader :id, :endpoint_id, :event, :status, :attempt_count, :response_status, :replay_count, :created_at

      def initialize(data)
        @id = data["id"]
        @endpoint_id = data["endpoint_id"]
        @event = data["event"]
        @status = data["status"]
        @attempt_count = data["attempt_count"] || 0
        @response_status = data["response_status"]
        @replay_count = data["replay_count"] || 0
        @created_at = data["created_at"]
      end

      def to_h
        {
          id: @id,
          endpoint_id: @endpoint_id,
          event: @event,
          status: @status,
          attempt_count: @attempt_count,
          response_status: @response_status,
          replay_count: @replay_count,
          created_at: @created_at
        }
      end
    end

    class DeliveryAttempt
      attr_reader :id, :attempt_number, :status_code, :response_body, :duration_ms, :error_message, :created_at

      def initialize(data)
        @id = data["id"]
        @attempt_number = data["attempt_number"]
        @status_code = data["status_code"]
        @response_body = data["response_body"]
        @duration_ms = data["duration_ms"]
        @error_message = data["error_message"]
        @created_at = data["created_at"]
      end

      def to_h
        {
          id: @id,
          attempt_number: @attempt_number,
          status_code: @status_code,
          response_body: @response_body,
          duration_ms: @duration_ms,
          error_message: @error_message,
          created_at: @created_at
        }
      end
    end

    class DeliveryList
      attr_reader :deliveries, :total, :page, :per_page

      def initialize(data)
        @deliveries = (data["deliveries"] || []).map { |d| Delivery.new(d) }
        @total = data["total"]
        @page = data["page"]
        @per_page = data["per_page"]
      end
    end

    class BatchResult
      attr_reader :deliveries, :errors

      def initialize(data)
        @deliveries = (data["deliveries"] || []).map { |d| Delivery.new(d) }
        @errors = data["errors"] || []
      end
    end

    class Stats
      attr_reader :total_deliveries, :delivered, :failed, :pending, :success_rate, :endpoints_count

      def initialize(data)
        @total_deliveries = data["total_deliveries"]
        @delivered = data["delivered"]
        @failed = data["failed"]
        @pending = data["pending"]
        @success_rate = data["success_rate"]
        @endpoints_count = data["endpoints_count"]
      end
    end
  end
end
