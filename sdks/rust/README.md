<h1 align="center">
    <a style="text-decoration: none" href="https://www.hooksniff.com">
      <img width="120" src="https://avatars.githubusercontent.com/u/80175132?s=200&v=4" />
      <p align="center">Svix - Webhooks as a service</p>
    </a>
</h1>
<h2 align="center">
  <a href="https://hooksniff.com">Website</a> | <a href="https://docs.hooksniff.com">Documentation</a> | <a href="https://hooksniff.com/slack">Community Slack</a>
<h2>

Rust library for interacting with the Svix API and verifying webhook signatures

![GitHub tag](https://img.shields.io/github/tag/hooksniff/hooksniff-webhooks.svg)
[![Crates.io](https://img.shields.io/crates/v/hooksniff)](https://crates.io/crates/hooksniff)
[![docs.rs](https://docs.rs/hooksniff/badge.svg)](https://docs.rs/hooksniff/)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Join our slack](https://img.shields.io/badge/Slack-join%20the%20community-blue?logo=slack&style=social)](https://www.hooksniff.com/slack/)

# Usage Documentation

You can find general usage documentation at <https://docs.hooksniff.com>.  For complete API documentation with code examples for each endpoint in all of our official client libraries head over to our API documentation site at <https://api.hooksniff.com>.

# Language Support

<table style="table-layout:fixed; white-space: nowrap;">
  <th colspan="2">⚡️ Features ⚡️</th>
  <tr>
    <th>Officially Supported</th>
    <th>✅</th>
  </tr>
  <tr>
    <th>API Support</th>
    <th>✅</th>
  </tr>
  <tr>
    <th>Signature Verification</th>
    <th>✅</th>
  </tr>
  <tr>
    <th>Caveats</th>
    <th>None! 🚀</th>
  </tr>
</table>

## Usage
Please refer to [the documentation](https://docs.hooksniff.com/) or [the API reference](https://api.hooksniff.com/docs) for more usage instructions.

# Optional Cargo Features

## TLS

By default reqwest uses rust-native-tls, which will use the operating system TLS framework if available, meaning Windows and macOS. On Linux, it will use OpenSSL 1.1.

[rustls-tls](https://github.com/rustls/rustls) can also be chosen, eg.:
```
hooksniff = { version = "N", features = ["rustls-tls"], default-features = false  }
```
