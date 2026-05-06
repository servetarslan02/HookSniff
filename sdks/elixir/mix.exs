defmodule HookRelay.MixProject do
  use Mix.Project

  @version "0.2.0"
  @source_url "https://github.com/servetarslan02/hookrelay"

  def project do
    [
      app: :hookrelay,
      version: @version,
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      name: "HookRelay",
      description: "Official Elixir client for the HookRelay webhook delivery service",
      source_url: @source_url,
      homepage_url: "https://hookrelay.io",
      package: package(),
      docs: docs()
    ]
  end

  def application do
    [
      extra_applications: [:logger, :inets, :ssl]
    ]
  end

  defp deps do
    [
      {:jason, "~> 1.4"},
      {:plug_crypto, "~> 1.2"},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end

  defp package do
    [
      name: "hookrelay",
      licenses: ["MIT"],
      links: %{"GitHub" => @source_url}
    ]
  end

  defp docs do
    [
      main: "HookRelay",
      source_ref: "v#{@version}"
    ]
  end
end
