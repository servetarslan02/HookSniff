// this file is @generated
use serde::{Deserialize, Serialize};

use super::{
    adobe_sign_config_out::AdobeSignConfigOut, airwallex_config_out::AirwallexConfigOut,
    checkbook_config_out::CheckbookConfigOut, cron_config::CronConfig,
    docusign_config_out::DocusignConfigOut, easypost_config_out::EasypostConfigOut,
    github_config_out::GithubConfigOut, hubspot_config_out::HubspotConfigOut,
    meta_config_out::MetaConfigOut, orum_io_config_out::OrumIoConfigOut,
    panda_doc_config_out::PandaDocConfigOut, port_io_config_out::PortIoConfigOut,
    rutter_config_out::RutterConfigOut, segment_config_out::SegmentConfigOut,
    shopify_config_out::ShopifyConfigOut, slack_config_out::SlackConfigOut,
    stripe_config_out::StripeConfigOut, hooksniff_config_out::HookSniffConfigOut,
    telnyx_config_out::TelnyxConfigOut, vapi_config_out::VapiConfigOut,
    veriff_config_out::VeriffConfigOut, vgs_config_out::VgsConfigOut,
    zoom_config_out::ZoomConfigOut,
};

#[derive(Clone, Debug, Default, PartialEq, Deserialize, Serialize)]
pub struct IngestSourceOut {
    #[serde(rename = "createdAt")]
    pub created_at: String,

    /// The Source's ID.
    pub id: String,

    #[serde(rename = "ingestUrl")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ingest_url: Option<String>,

    pub metadata: std::collections::HashMap<String, String>,

    pub name: String,

    /// The Source's UID.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uid: Option<String>,

    #[serde(rename = "updatedAt")]
    pub updated_at: String,

    #[serde(flatten)]
    pub config: IngestSourceOutConfig,
}

#[derive(Clone, Debug, PartialEq, Deserialize, Serialize)]
#[serde(tag = "type", content = "config")]
pub enum IngestSourceOutConfig {
    #[serde(rename = "generic-webhook")]
    GenericWebhook,
    #[serde(rename = "cron")]
    Cron(CronConfig),
    #[serde(rename = "adobe-sign")]
    AdobeSign(AdobeSignConfigOut),
    #[serde(rename = "beehiiv")]
    Beehiiv(HookSniffConfigOut),
    #[serde(rename = "brex")]
    Brex(HookSniffConfigOut),
    #[serde(rename = "checkbook")]
    Checkbook(CheckbookConfigOut),
    #[serde(rename = "clerk")]
    Clerk(HookSniffConfigOut),
    #[serde(rename = "docusign")]
    Docusign(DocusignConfigOut),
    #[serde(rename = "easypost")]
    Easypost(EasypostConfigOut),
    #[serde(rename = "github")]
    Github(GithubConfigOut),
    #[serde(rename = "guesty")]
    Guesty(HookSniffConfigOut),
    #[serde(rename = "hubspot")]
    Hubspot(HubspotConfigOut),
    #[serde(rename = "incident-io")]
    IncidentIo(HookSniffConfigOut),
    #[serde(rename = "lithic")]
    Lithic(HookSniffConfigOut),
    #[serde(rename = "meta")]
    Meta(MetaConfigOut),
    #[serde(rename = "nash")]
    Nash(HookSniffConfigOut),
    #[serde(rename = "orum-io")]
    OrumIo(OrumIoConfigOut),
    #[serde(rename = "panda-doc")]
    PandaDoc(PandaDocConfigOut),
    #[serde(rename = "port-io")]
    PortIo(PortIoConfigOut),
    #[serde(rename = "psi-fi")]
    PsiFi(HookSniffConfigOut),
    #[serde(rename = "pleo")]
    Pleo(HookSniffConfigOut),
    #[serde(rename = "replicate")]
    Replicate(HookSniffConfigOut),
    #[serde(rename = "resend")]
    Resend(HookSniffConfigOut),
    #[serde(rename = "rutter")]
    Rutter(RutterConfigOut),
    #[serde(rename = "safebase")]
    Safebase(HookSniffConfigOut),
    #[serde(rename = "sardine")]
    Sardine(HookSniffConfigOut),
    #[serde(rename = "segment")]
    Segment(SegmentConfigOut),
    #[serde(rename = "shopify")]
    Shopify(ShopifyConfigOut),
    #[serde(rename = "slack")]
    Slack(SlackConfigOut),
    #[serde(rename = "stripe")]
    Stripe(StripeConfigOut),
    #[serde(rename = "stych")]
    Stych(HookSniffConfigOut),
    #[serde(rename = "hooksniff")]
    HookSniff(HookSniffConfigOut),
    #[serde(rename = "zoom")]
    Zoom(ZoomConfigOut),
    #[serde(rename = "telnyx")]
    Telnyx(TelnyxConfigOut),
    #[serde(rename = "vapi")]
    Vapi(VapiConfigOut),
    #[serde(rename = "open-ai")]
    OpenAi(HookSniffConfigOut),
    #[serde(rename = "render")]
    Render(HookSniffConfigOut),
    #[serde(rename = "veriff")]
    Veriff(VeriffConfigOut),
    #[serde(rename = "airwallex")]
    Airwallex(AirwallexConfigOut),
    #[serde(rename = "vgs")]
    Vgs(VgsConfigOut),
}

#[allow(clippy::derivable_impls)]
impl Default for IngestSourceOutConfig {
    fn default() -> Self {
        Self::GenericWebhook
    }
}
