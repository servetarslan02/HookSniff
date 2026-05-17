<?php

declare(strict_types=1);

namespace HookSniff;

use GuzzleHttp\Client;
use HookSniff\Api\Authentication;
use HookSniff\Api\Endpoint;
use HookSniff\Api\EventType;
use HookSniff\Api\Health;
use HookSniff\Api\Message;
use HookSniff\Api\MessageAttempt;
use HookSniff\Api\Statistics;
use HookSniff\Api\Environment;
use HookSniff\Request\HookSniffHttpClient;

class HookSniff
{
    public Authentication $authentication;
    public Endpoint $endpoint;
    public EventType $eventType;
    public Health $health;
    public Message $message;
    public MessageAttempt $messageAttempt;
    public Statistics $statistics;
    public Environment $environment;

    public function __construct(
        string $token,
        ?HookSniffOptions $options = null,
        ?Client $httpClient = null,
    ) {
        $baseUrl = $options?->serverUrl ?? 'https://api.hooksniff-1046140057667.europe-west1.run.app';

        $hooksniffHttpClient = new HookSniffHttpClient(
            token: $token,
            baseUrl: $baseUrl,
            guzzleClient: $httpClient ?? new Client(),
            opts: $options ?? HookSniffOptions::newDefault($token),
        );

        $this->authentication = new Authentication($hooksniffHttpClient);
        $this->endpoint = new Endpoint($hooksniffHttpClient);
        $this->eventType = new EventType($hooksniffHttpClient);
        $this->health = new Health($hooksniffHttpClient);
        $this->message = new Message($hooksniffHttpClient);
        $this->messageAttempt = new MessageAttempt($hooksniffHttpClient);
        $this->statistics = new Statistics($hooksniffHttpClient);
        $this->environment = new Environment($hooksniffHttpClient);
    }
}
