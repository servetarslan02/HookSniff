<h1 align="center">
    <a style="text-decoration: none" href="https://www.hooksniff.com">
      <img width="120" src="https://avatars.githubusercontent.com/u/80175132?s=200&v=4" />
      <p align="center">Svix - Webhooks as a service</p>
    </a>
</h1>
<h2 align="center">
  <a href="https://hooksniff.com">Website</a> | <a href="https://docs.hooksniff.com">Documentation</a> | <a href="https://hooksniff.com/slack">Community Slack</a>
<h2>

Java library for interacting with the Svix API and verifying webhook signatures

![GitHub tag](https://img.shields.io/github/tag/hooksniff/hooksniff-webhooks.svg)
[![Maven Central (Java)](https://img.shields.io/maven-central/v/com.hooksniff/hooksniff?label=maven-central%20(java))](https://search.maven.org/artifact/com.hooksniff/hooksniff)

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
    <th>Async support planned. (If you use kotlin, checkout our kotlin library for coroutine support.)</th>
  </tr>
</table>

# Installation

### Maven users

Add this dependency to your project's POM:

```xml
<dependency>
  <groupId>com.hooksniff</groupId>
  <artifactId>hooksniff</artifactId>
  <version>1.93.0</version>
  <scope>compile</scope>
</dependency>
```

### Gradle users

Add this dependency to your project's build file:

```groovy
implementation "com.hooksniff:hooksniff:1.93.0"
```

# Development

First checkout the [core README](../README.md#development) for details on how to generate our API bindings, then follow the steps below.

## Requirements

 - Java 1.8+
 - Gradle

## Building the library
```sh
./gradlew build
```

## Running Tests

Simply run:

```sh
./gradlew test
```

## Publishing to Maven

```sh
./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository
```
