<?php

declare(strict_types=1);

namespace HookSniff\Models;

class MessageIn implements \JsonSerializable
{
    private array $setFields = [];

    /**
     * @param list<string>|null       $channels  List of free-form identifiers that endpoints can filter by
     * @param \DateTimeImmutable|null $deliverAt The date and time at which the message will be delivered.
     * @param string|null $eventId   Optional unique identifier for the message
     * @param string      $eventType The event type's name
     * @param array       $payload   JSON payload to send as the request body of the webhook.
     * @param int|null          $payloadRetentionHours  Optional number of hours to retain the message payload.
     * @param int|null          $payloadRetentionPeriod Optional number of days to retain the message payload. Defaults to 90.
     * @param list<string>|null $tags                   List of free-form tags that can be filtered by when listing messages
     */
    private function __construct(
        public readonly string $eventType,
        public readonly array $payload,
        public readonly ?array $channels = null,
        public readonly ?\DateTimeImmutable $deliverAt = null,
        public readonly ?string $eventId = null,
        public readonly ?int $payloadRetentionHours = null,
        public readonly ?int $payloadRetentionPeriod = null,
        public readonly ?array $tags = null,
        array $setFields = [],
    ) {
        $this->setFields = $setFields;
    }

    /**
     * Create an instance of MessageIn with required fields.
     */
    public static function create(
        string $eventType,
        array $payload,
    ): self {
        return new self(
            channels: null,
            deliverAt: null,
            eventId: null,
            eventType: $eventType,
            payload: $payload,
            payloadRetentionHours: null,
            payloadRetentionPeriod: null,
            tags: null,
            setFields: ['eventType' => true, 'payload' => true]
        );
    }

    public function withChannels(?array $channels): self
    {
        $setFields = $this->setFields;
        $setFields['channels'] = true;

        return new self(
            channels: $channels,
            deliverAt: $this->deliverAt,
            eventId: $this->eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $this->payloadRetentionHours,
            payloadRetentionPeriod: $this->payloadRetentionPeriod,
            tags: $this->tags,
            setFields: $setFields
        );
    }

    public function withDeliverAt(?\DateTimeImmutable $deliverAt): self
    {
        $setFields = $this->setFields;
        $setFields['deliverAt'] = true;

        return new self(
            channels: $this->channels,
            deliverAt: $deliverAt,
            eventId: $this->eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $this->payloadRetentionHours,
            payloadRetentionPeriod: $this->payloadRetentionPeriod,
            tags: $this->tags,
            setFields: $setFields
        );
    }

    public function withEventId(?string $eventId): self
    {
        $setFields = $this->setFields;
        $setFields['eventId'] = true;

        return new self(
            channels: $this->channels,
            deliverAt: $this->deliverAt,
            eventId: $eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $this->payloadRetentionHours,
            payloadRetentionPeriod: $this->payloadRetentionPeriod,
            tags: $this->tags,
            setFields: $setFields
        );
    }

    public function withPayloadRetentionHours(?int $payloadRetentionHours): self
    {
        $setFields = $this->setFields;
        $setFields['payloadRetentionHours'] = true;

        return new self(
            channels: $this->channels,
            deliverAt: $this->deliverAt,
            eventId: $this->eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $payloadRetentionHours,
            payloadRetentionPeriod: $this->payloadRetentionPeriod,
            tags: $this->tags,
            setFields: $setFields
        );
    }

    public function withPayloadRetentionPeriod(?int $payloadRetentionPeriod): self
    {
        $setFields = $this->setFields;
        $setFields['payloadRetentionPeriod'] = true;

        return new self(
            channels: $this->channels,
            deliverAt: $this->deliverAt,
            eventId: $this->eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $this->payloadRetentionHours,
            payloadRetentionPeriod: $payloadRetentionPeriod,
            tags: $this->tags,
            setFields: $setFields
        );
    }

    public function withTags(?array $tags): self
    {
        $setFields = $this->setFields;
        $setFields['tags'] = true;

        return new self(
            channels: $this->channels,
            deliverAt: $this->deliverAt,
            eventId: $this->eventId,
            eventType: $this->eventType,
            payload: $this->payload,
            payloadRetentionHours: $this->payloadRetentionHours,
            payloadRetentionPeriod: $this->payloadRetentionPeriod,
            tags: $tags,
            setFields: $setFields
        );
    }

    public function jsonSerialize(): mixed
    {
        $data = [
            'eventType' => $this->eventType,
            'payload' => \HookSniff\Utils::newStdClassIfArrayIsEmpty($this->payload),
        ];

        if (isset($this->setFields['channels'])) {
            $data['channels'] = $this->channels;
        }
        if (isset($this->setFields['deliverAt'])) {
            $data['deliverAt'] = $this->deliverAt->format('c');
        }
        if (isset($this->setFields['eventId'])) {
            $data['eventId'] = $this->eventId;
        }
        if (isset($this->setFields['payloadRetentionHours'])) {
            $data['payloadRetentionHours'] = $this->payloadRetentionHours;
        }
        if (isset($this->setFields['payloadRetentionPeriod'])) {
            $data['payloadRetentionPeriod'] = $this->payloadRetentionPeriod;
        }
        if (isset($this->setFields['tags'])) {
            $data['tags'] = $this->tags;
        }

        return \HookSniff\Utils::newStdClassIfArrayIsEmpty($data);
    }

    /**
     * Create an instance from a mixed obj.
     */
    public static function fromMixed(mixed $data): self
    {
        return new self(
            channels: \HookSniff\Utils::getValFromJson($data, 'channels', false, 'MessageIn'),
            deliverAt: \HookSniff\Utils::deserializeDt($data, 'deliverAt', false, 'MessageIn'),
            eventId: \HookSniff\Utils::deserializeString($data, 'eventId', false, 'MessageIn'),
            eventType: \HookSniff\Utils::deserializeString($data, 'eventType', true, 'MessageIn'),
            payload: \HookSniff\Utils::getValFromJson($data, 'payload', true, 'MessageIn'),
            payloadRetentionHours: \HookSniff\Utils::deserializeInt($data, 'payloadRetentionHours', false, 'MessageIn'),
            payloadRetentionPeriod: \HookSniff\Utils::deserializeInt($data, 'payloadRetentionPeriod', false, 'MessageIn'),
            tags: \HookSniff\Utils::getValFromJson($data, 'tags', false, 'MessageIn'),
        );
    }

    /**
     * Create an instance from a json string.
     */
    public static function fromJson(string $json): self
    {
        $data = json_decode(json: $json, associative: true, depth: 512, flags: JSON_THROW_ON_ERROR);

        return self::fromMixed($data);
    }
}
