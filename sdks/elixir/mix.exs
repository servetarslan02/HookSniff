defmodule HookSniff.MixProject do
  use Mix.Project

  @version "0.2.0"
  @source_url "https://github.com/servetarslan02/hooksniff"

  def project do
    [
      app: :hooksniff,
      version: @version,
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      name: "HookSniff",
      description: "Official Elixir client for the HookSniff webhook delivery service",
      source_url: @source_url,
      homepage_url: "https://hooksniff.io",
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
      name: "hooksniff",
      licenses: ["MIT"],
      links: %{"GitHub" => @source_url}
    ]
  end

  defp docs do
    [
      main: "HookSniff",
      source_ref: "v#{@version}"
    ]
  end
end
