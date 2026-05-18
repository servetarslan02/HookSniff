# frozen_string_literal: true

module HookSniff
  class MessagePoller
    def initialize(client)
      @client = client
    end

    # Poll for new messages since the consumer's cursor.
    def poll(consumer_id, limit: nil, endpoint_id: nil, event_type: nil, include_payload: true)
      params = { consumer_id: consumer_id, include_payload: include_payload }
      params[:limit] = limit if limit
      params[:endpoint_id] = endpoint_id if endpoint_id
      params[:event_type] = event_type if event_type
      @client.request(:get, "/api/v1/message-poller/poll", params: params)
    end

    # Seek cursor to a specific message.
    def seek(consumer_id, message_id, endpoint_id: nil)
      body = { consumer_id: consumer_id, message_id: message_id }
      body[:endpoint_id] = endpoint_id if endpoint_id
      @client.request(:post, "/api/v1/message-poller/seek", body: body)
    end

    # Commit cursor — advance past a processed message.
    def commit(consumer_id, message_id, endpoint_id: nil)
      body = { consumer_id: consumer_id, message_id: message_id }
      body[:endpoint_id] = endpoint_id if endpoint_id
      @client.request(:post, "/api/v1/message-poller/commit", body: body)
    end
  end
end
