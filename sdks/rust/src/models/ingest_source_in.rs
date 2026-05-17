// this file is @generated
use serde::{Deserialize, Serialize};

use super::{
    adobe_sign_config::AdobeSignConfig, airwallex_config::AirwallexConfig,
    checkbook_config::CheckbookConfig, cron_config::CronConfig, docusign_config::DocusignConfig,
    easypost_config::EasypostConfig, github_config::GithubConfig, hubspot_config::HubspotConfig,
    meta_config::MetaConfig, orum_io_config::OrumIoConfig, panda_doc_config::PandaDocConfig,
    port_io_config::PortIoConfig, rutter_config::RutterConfig, segment_config::SegmentConfig,
    shopify_config::ShopifyConfig, slack_config::SlackConfig, stripe_config::StripeConfig,
    hooksniff_config::HookSniffConfig, telnyx_config::TelnyxConfig, vapi_config::VapiConfig,
    veriff_config::VeriffConfig, vgs_config::VgsConfig, zoom_config::ZoomConfig,
};

#[derive(Clone, Debug, Default, PartialEq, Deserialize, Serialize)]
pub struct IngestSourceIn {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<std::collections::HashMap<String, String>>,

    pub name: String,

    /// The Source's UID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uid: Option<String>,

    #[serde(flatten)]
    pub config: IngestSourceInConfig,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(tag = "type", content = "config")]
pub enum IngestSourceInConfig {
    #[serde(rename = "generic-webhook")]
    GenericWebhook,
    #[serde(rename = "cron")]
    Cron(CronConfig),
    #[serde(rename = "adobe-sign")]
    AdobeSign(AdobeSignConfig),
    #[serde(rename = "beehiiv")]
    Beehiiv(HookSniffConfig),
    #[serde(rename = "brex")]
    Brex(HookSniffConfig),
    #[serde(rename = "checkbook")]
    Checkbook(CheckbookConfig),
    #[serde(rename = "clerk")]
    Clerk(HookSniffConfig),
    #[serde(rename = "docusign")]
    Docusign(DocusignConfig),
    #[serde(rename = "easypost")]
    Easypost(EasypostConfig),
    #[serde(rename = "github")]
    Github(GithubConfig),
    #[serde(rename = "guesty")]
    Guesty(HookSniffConfig),
    #[serde(rename = "hubspot")]
    Hubspot(HubspotConfig),
    #[serde(rename = "incident-io")]
    IncidentIo(HookSniffConfig),
    #[serde(rename = "lithic")]
    Lithic(HookSniffConfig),
    #[serde(rename = "meta")]
    Meta(MetaConfig),
    #[serde(rename = "nash")]
    Nash(HookSniffConfig),
    #[serde(rename = "orum-io")]
    OrumIo(OrumIoConfig),
    #[serde(rename = "panda-doc")]
    PandaDoc(PandaDocConfig),
    #[serde(rename = "port-io")]
    PortIo(PortIoConfig),
    #[serde(rename = "pleo")]
    Pleo(HookSniffConfig),
    #[serde(rename = "psi-fi")]
    PsiFi(HookSniffConfig),
    #[serde(rename = "replicate")]
    Replicate(HookSniffConfig),
    #[serde(rename = "resend")]
    Resend(HookSniffConfig),
    #[serde(rename = "rutter")]
    Rutter(RutterConfig),
    #[serde(rename = "safebase")]
    Safebase(HookSniffConfig),
    #[serde(rename = "sardine")]
    Sardine(HookSniffConfig),
    #[serde(rename = "segment")]
    Segment(SegmentConfig),
    #[serde(rename = "shopify")]
    Shopify(ShopifyConfig),
    #[serde(rename = "slack")]
    Slack(SlackConfig),
    #[serde(rename = "stripe")]
    Stripe(StripeConfig),
    #[serde(rename = "stych")]
    Stych(HookSniffConfig),
    #[serde(rename = "hooksniff")]
    HookSniff(HookSniffConfig),
    #[serde(rename = "zoom")]
    Zoom(ZoomConfig),
    #[serde(rename = "telnyx")]
    Telnyx(TelnyxConfig),
    #[serde(rename = "vapi")]
    Vapi(VapiConfig),
    #[serde(rename = "open-ai")]
    OpenAi(HookSniffConfig),
    #[serde(rename = "render")]
    Render(HookSniffConfig),
    #[serde(rename = "veriff")]
    Veriff(VeriffConfig),
    #[serde(rename = "airwallex")]
    Airwallex(AirwallexConfig),
    #[serde(rename = "vgs")]
    Vgs(VgsConfig),
}

#[allow(clippy::derivable_impls)]
impl Default for IngestSourceInConfig {
    fn default() -> Self {
        Self::GenericWebhook
    }
}
