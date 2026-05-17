defmodule HookSniffAPI.RetryMiddleware do
  @moduledoc """
  Tesla middleware for automatic retry on 429 (rate limit) and 5xx errors.

  Respects the Retry-After header for 429 responses.
  """

  @behaviour Tesla.Middleware

  @default_retry_schedule [50, 100, 200]

  @impl true
  def call(env, next, opts) do
    retry_schedule = Keyword.get(opts, :retry_schedule, @default_retry_schedule)
    do_request(env, next, retry_schedule, 0)
  end

  defp do_request(env, next, retry_schedule, attempt) do
    case Tesla.run(env, next) do
      {:ok, %Tesla.Env{status: 429} = response} ->
        if attempt < length(retry_schedule) do
          delay = get_retry_delay(response, retry_schedule, attempt)
          Process.sleep(delay)
          new_env = add_retry_header(env, attempt + 1)
          do_request(new_env, next, retry_schedule, attempt + 1)
        else
          {:ok, response}
        end

      {:ok, %Tesla.Env{status: status} = response} when status >= 500 ->
        if attempt < length(retry_schedule) do
          delay = Enum.at(retry_schedule, attempt, 200)
          Process.sleep(delay)
          new_env = add_retry_header(env, attempt + 1)
          do_request(new_env, next, retry_schedule, attempt + 1)
        else
          {:ok, response}
        end

      other ->
        other
    end
  end

  defp get_retry_delay(response, retry_schedule, attempt) do
    case Tesla.get_header(response, "retry-after") do
      nil ->
        Enum.at(retry_schedule, attempt, 200)

      retry_after ->
        case Integer.parse(retry_after) do
          {seconds, _} -> seconds * 1000
          :error -> Enum.at(retry_schedule, attempt, 200)
        end
    end
  end

  defp add_retry_header(env, count) do
    Tesla.put_header(env, "hooksniff-retry-count", to_string(count))
  end
end
