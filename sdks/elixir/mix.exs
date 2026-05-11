defmodule HookSniff.MixProject do
  use Mix.Project

  @version "0.3.0"
  @source_url "https://github.com/servetarslan02/HookSniff"

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
      homepage_url: "https://hooksniff.vercel.app",
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
      {:tesla, "~> 1.7"},
      {:hackney, "~> 1.18"},
      {:ex_doc, "~> 0.34", only: :dev, runtime: false}
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
