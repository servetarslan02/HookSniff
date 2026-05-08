defmodule HookSniff.Error do
  defexception [:message, :code, :status]

  @type t :: %__MODULE__{
          message: String.t(),
          code: atom(),
          status: integer() | nil
        }
end
