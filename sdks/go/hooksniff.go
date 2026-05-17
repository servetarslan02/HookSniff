// Package hooksniff provides the HookSniff API client.
// Adapted from Svix SDK architecture.
package hooksniff

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/servetarslan02/hooksniff-go/internal"
)

type (
	HookSniffOptions struct {
		ServerUrl        *url.URL
		HTTPClient       *http.Client
		TransportWrapper func(http.RoundTripper) http.RoundTripper
		RetrySchedule    *[]time.Duration
		Debug            bool
	}
	HookSniff struct {
		client *internal.HookSniffHttpClient

		Authentication *Authentication
		Endpoint       *Endpoint
		EventType      *EventType
		Message        *Message
		MessageAttempt *MessageAttempt
		Statistics     *Statistics
		Environment    *Environment
		BackgroundTask *BackgroundTask
		OperationalWebhook *OperationalWebhook
		MessagePoller *MessagePoller
		Inbound *Inbound
	}
)

func New(token string, options *HookSniffOptions) (*HookSniff, error) {
	hooksniffHttpClient := internal.DefaultHookSniffHttpClient(getDefaultBaseUrl(token))

	if options != nil {
		if options.ServerUrl != nil {
			hooksniffHttpClient.BaseURL = options.ServerUrl.String()
		}
		if options.RetrySchedule != nil {
			if len(*options.RetrySchedule) > 5 {
				return nil, fmt.Errorf("number of retries must not exceed 5")
			}
			hooksniffHttpClient.RetrySchedule = *options.RetrySchedule
		}
		if options.HTTPClient != nil {
			hooksniffHttpClient.HTTPClient = options.HTTPClient
		}
		if options.TransportWrapper != nil {
			hooksniffHttpClient.HTTPClient.Transport = options.TransportWrapper(hooksniffHttpClient.HTTPClient.Transport)
		}
		hooksniffHttpClient.Debug = options.Debug
	}

	hooksniffHttpClient.DefaultHeaders["Authorization"] = fmt.Sprintf("Bearer %s", token)
	hooksniffHttpClient.DefaultHeaders["User-Agent"] = fmt.Sprintf("hooksniff-libs/%s/go", Version)

	hs := HookSniff{
		client:         &hooksniffHttpClient,
		Authentication: newAuthentication(&hooksniffHttpClient),
		Endpoint:       newEndpoint(&hooksniffHttpClient),
		EventType:      newEventType(&hooksniffHttpClient),
		Message:        newMessage(&hooksniffHttpClient),
		MessageAttempt: newMessageAttempt(&hooksniffHttpClient),
		Statistics:     newStatistics(&hooksniffHttpClient),
		Environment:    newEnvironment(&hooksniffHttpClient),
		BackgroundTask: newBackgroundTask(&hooksniffHttpClient),
		OperationalWebhook: newOperationalWebhook(&hooksniffHttpClient),
		MessagePoller: newMessagePoller(&hooksniffHttpClient),
		Inbound: newInbound(&hooksniffHttpClient),
	}
	return &hs, nil
}

func getDefaultBaseUrl(token string) *url.URL {
	defaultUrl := "https://hooksniff-api-1046140057667.europe-west1.run.app"
	if token != "" {
		parts := strings.Split(token, ".")
		if len(parts) > 1 {
			region := parts[len(parts)-1]
			switch region {
			case "us":
				defaultUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app"
			case "eu":
				defaultUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app"
			}
		}
	}
	u, _ := url.Parse(defaultUrl)
	return u
}

func (s *HookSniff) SetUseragentSuffix(suffix string) {
	s.client.DefaultHeaders["User-Agent"] = fmt.Sprintf("%s %s", s.client.DefaultHeaders["User-Agent"], suffix)
}

func isUrlValid(urlToTest string) bool {
	if urlToTest == "" {
		return false
	}
	_, err := url.ParseRequestURI(urlToTest)
	if err != nil {
		return false
	}
	u, err := url.Parse(urlToTest)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}
	return true
}

func isValidWebhookId(webhookId string) bool {
	r, _ := regexp.Compile("^whsec_[a-zA-Z0-9+/=]+$")
	return r.MatchString(webhookId)
}
