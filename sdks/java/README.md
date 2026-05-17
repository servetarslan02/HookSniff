# HookSniff Java SDK

Java SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

## Installation

### Gradle

```groovy
implementation 'com.hooksniff:hooksniff:1.0.0'
```

### Maven

```xml
<dependency>
    <groupId>com.hooksniff</groupId>
    <artifactId>hooksniff</artifactId>
    <version>1.0.0</version>
</dependency>
```

## Usage

```java
import com.hooksniff.HookSniff;
import com.hooksniff.HookSniffOptions;
import com.hooksniff.models.*;

// Initialize the client
HookSniff hs = new HookSniff("YOUR_API_KEY");

// List endpoints
EndpointListOut endpoints = hs.getEndpoint().list();

// Create an endpoint
EndpointIn endpointIn = new EndpointIn();
endpointIn.setUrl("https://example.com/webhook");
endpointIn.setDescription("My endpoint");
EndpointOut endpoint = hs.getEndpoint().create(endpointIn);

// Send a webhook message
MessageIn messageIn = new MessageIn();
messageIn.setEventType("order.created");
messageIn.setPayload(Map.of("order_id", "ord_123", "amount", 9999));
MessageOut message = hs.getMessage().create(messageIn);

// List delivery attempts
MessageAttemptListOut attempts = hs.getMessageAttempt().listByMsg(message.getId());
```

## Webhook Verification

```java
import com.hooksniff.Webhook;
import com.hooksniff.exceptions.WebhookVerificationException;

Webhook wh = new Webhook("whsec_...");

try {
    String payload = wh.verify(requestBody, Map.of(
        "hooksniff-id", request.getHeader("hooksniff-id"),
        "hooksniff-signature", request.getHeader("hooksniff-signature"),
        "hooksniff-timestamp", request.getHeader("hooksniff-timestamp")
    ));
    // payload is valid
} catch (WebhookVerificationException e) {
    // invalid signature
}
```

## API Resources

| Resource | Description |
|----------|-------------|
| `hs.getAuthentication()` | Login, register, 2FA, password reset |
| `hs.getEndpoint()` | CRUD for webhook endpoints |
| `hs.getEventType()` | Manage event types |
| `hs.getHealth()` | System health check |
| `hs.getMessage()` | Send webhook messages |
| `hs.getMessageAttempt()` | View delivery attempts |
| `hs.getStatistics()` | Delivery statistics |

## License

MIT
