// this file is @generated
#![warn(unreachable_pub)]

mod client;
mod deprecated;

pub use self::client::{HookSniff, HookSniffOptions};
pub use crate::models::*;

mod authentication;
mod background_task;
mod endpoint;
mod environment;
mod operational_webhook;
mod message_poller;
mod inbound;
mod connector;
mod integration;
mod stream;
mod event_type;
mod health;
mod message;
mod message_attempt;
mod statistics;

pub use self::{
    authentication::{Authentication, AuthenticationLogoutOptions},
    background_task::BackgroundTask,
    endpoint::{
        Endpoint, EndpointCreateOptions, EndpointListOptions,
        EndpointRotateSecretOptions, EndpointSendExampleOptions,
    },
    environment::Environment,
    event_type::{
        EventType, EventTypeCreateOptions, EventTypeDeleteOptions, EventTypeImportOpenapiOptions,
        EventTypeListOptions,
    },
    health::Health,
    message::{
        Message, MessageCreateOptions, MessageGetOptions, MessageListOptions,
    },
    message_attempt::{
        MessageAttempt, MessageAttemptGetOptions, MessageAttemptListAttemptedDestinationsOptions,
        MessageAttemptListAttemptedMessagesOptions, MessageAttemptListByEndpointOptions,
        MessageAttemptListByMsgOptions, MessageAttemptResendOptions,
    },
    statistics::Statistics,
    message_poller::MessagePoller,
    inbound::Inbound,
    connector::ConnectorApi,
    integration::IntegrationApi,
    stream::StreamApi,
};

impl HookSniff {
    pub fn authentication(&self) -> Authentication<'_> {
        Authentication::new(&self.cfg)
    }

    pub fn background_task(&self) -> BackgroundTask<'_> {
        BackgroundTask::new(&self.cfg)
    }

    pub fn operational_webhook(&self) -> OperationalWebhook<'_> {
        OperationalWebhook::new(&self.cfg)
    }

    pub fn message_poller(&self) -> MessagePoller<'_> {
        MessagePoller::new(&self.cfg)
    }

    pub fn inbound(&self) -> Inbound<'_> {
        Inbound::new(&self.cfg)
    }

    pub fn connector(&self) -> ConnectorApi<'_> {
        ConnectorApi::new(&self.cfg)
    }

    pub fn integration(&self) -> IntegrationApi<'_> {
        IntegrationApi::new(&self.cfg)
    }

    pub fn stream(&self) -> StreamApi<'_> {
        StreamApi::new(&self.cfg)
    }

    pub fn endpoint(&self) -> Endpoint<'_> {
        Endpoint::new(&self.cfg)
    }

    pub fn environment(&self) -> Environment<'_> {
        Environment::new(&self.cfg)
    }

    pub fn event_type(&self) -> EventType<'_> {
        EventType::new(&self.cfg)
    }

    pub fn health(&self) -> Health<'_> {
        Health::new(&self.cfg)
    }

    pub fn message(&self) -> Message<'_> {
        Message::new(&self.cfg)
    }

    pub fn message_attempt(&self) -> MessageAttempt<'_> {
        MessageAttempt::new(&self.cfg)
    }

    pub fn statistics(&self) -> Statistics {
        Statistics
    }
}
