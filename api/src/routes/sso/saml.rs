//! SAML Response Parsing & Signature Verification
//!
//! Helpers for parsing SAML XML assertions and verifying
//! RSA-SHA256 cryptographic signatures.

use crate::error::AppError;
use crate::error::ErrorCode;
use super::SamlAssertion;

// ── SAML Response Parsing ───────────────────────────────────

pub fn parse_saml_response(xml: &str) -> Result<SamlAssertion, AppError> {
    // Extract NameID
    let name_id = extract_xml_text(xml, "NameID")
        .or_else(|| extract_xml_attribute(xml, "NameID", "NameID"))
        .ok_or_else(|| AppError::BadRequest("No NameID found in SAML assertion".into()))?;

    // Extract SessionIndex
    let session_index = extract_xml_attribute(xml, "AuthnStatement", "SessionIndex");

    // Extract attributes
    let mut attributes = std::collections::HashMap::new();

    // Try to find all Attribute elements
    use quick_xml::Reader;
    use quick_xml::events::Event;

    let mut reader = Reader::from_str(xml);
    let mut in_attribute = false;
    let mut current_attr_name = String::new();
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) | Ok(Event::Empty(ref e)) => {
                let name = e.name();
                let local = String::from_utf8_lossy(name.local_name().as_ref()).to_string();

                if local == "Attribute" {
                    // Get Name attribute
                    for attr in e.attributes().flatten() {
                        let key = String::from_utf8_lossy(attr.key.local_name().as_ref()).to_string();
                        if key == "Name" {
                            current_attr_name = String::from_utf8_lossy(&attr.value).to_string();
                            in_attribute = true;
                        }
                    }
                } else if local == "AttributeValue" && in_attribute {
                    // Read text content
                    let mut text = String::new();
                    loop {
                        match reader.read_event_into(&mut buf) {
                            Ok(Event::Text(ref t)) => {
                                text.push_str(&t.unescape().unwrap_or_default());
                            }
                            Ok(Event::CData(ref c)) => {
                                text.push_str(&String::from_utf8_lossy(c));
                            }
                            Ok(Event::End(ref e)) => {
                                let end_local = String::from_utf8_lossy(e.name().local_name().as_ref()).to_string();
                                if end_local == "AttributeValue" {
                                    break;
                                }
                            }
                            Ok(Event::Eof) => break,
                            _ => {}
                        }
                    }
                    if !current_attr_name.is_empty() {
                        attributes.insert(current_attr_name.clone(), text);
                    }
                    in_attribute = false;
                }
            }
            Ok(Event::End(ref e)) => {
                let local = String::from_utf8_lossy(e.name().local_name().as_ref()).to_string();
                if local == "Attribute" {
                    in_attribute = false;
                }
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
        buf.clear();
    }

    // Extract NotOnOrAfter from SubjectConfirmationData
    let not_on_or_after = extract_xml_attribute(xml, "SubjectConfirmationData", "NotOnOrAfter")
        .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&chrono::Utc));

    // Extract InResponseTo from Response element
    let in_response_to = extract_xml_attribute(xml, "Response", "InResponseTo");

    // Extract Destination from Response element
    let destination = extract_xml_attribute(xml, "Response", "Destination");

    // Extract Audience
    let audience = extract_xml_text(xml, "Audience");

    // Extract certificate from Signature
    let certificate = extract_xml_text(xml, "X509Certificate");

    Ok(SamlAssertion {
        name_id,
        session_index,
        attributes,
        not_on_or_after,
        in_response_to,
        destination,
        audience,
        certificate,
    })
}

// ── XML Helper Functions ────────────────────────────────────

/// Extract text content from an XML element by tag name (namespace-agnostic).
///
/// Uses `quick-xml` to properly parse XML and find the first element whose
/// local name matches `tag`, regardless of namespace prefix (saml:, saml2p:, ds:, etc).
pub fn extract_xml_text(xml: &str, tag: &str) -> Option<String> {
    use quick_xml::Reader;
    use quick_xml::events::Event;

    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();
    let mut found = false;

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                if local_name_matches(e.name(), tag) {
                    found = true;
                    // Read text content
                    let mut text = String::new();
                    loop {
                        match reader.read_event_into(&mut buf) {
                            Ok(Event::Text(ref t)) => {
                                text.push_str(&t.unescape().unwrap_or_default());
                            }
                            Ok(Event::CData(ref c)) => {
                                text.push_str(&String::from_utf8_lossy(c));
                            }
                            Ok(Event::End(ref end_e)) => {
                                if local_name_matches(end_e.name(), tag) {
                                    return Some(text);
                                }
                            }
                            Ok(Event::Eof) => break,
                            _ => {}
                        }
                    }
                    if found && !text.is_empty() {
                        return Some(text);
                    }
                }
            }
            Ok(Event::Empty(ref e)) => {
                if local_name_matches(e.name(), tag) {
                    // Self-closing element — check for text attribute or return empty
                    return Some(String::new());
                }
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
        buf.clear();
    }

    None
}

/// Extract an attribute value from the first XML element matching `element` by local name.
///
/// Namespace-agnostic: matches `element` regardless of prefix.
pub fn extract_xml_attribute(xml: &str, element: &str, attr: &str) -> Option<String> {
    use quick_xml::Reader;
    use quick_xml::events::Event;

    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) | Ok(Event::Empty(ref e)) => {
                if local_name_matches(e.name(), element) {
                    for attribute in e.attributes().flatten() {
                        if local_name_matches(attribute.key, attr) {
                            return Some(String::from_utf8_lossy(&attribute.value).to_string());
                        }
                    }
                }
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
        buf.clear();
    }

    None
}

/// Extract a SAML AttributeValue by AttributeName.
///
/// Finds `<saml:Attribute Name="xxx">` then extracts the text of its `<saml:AttributeValue>` child.
pub fn extract_saml_attribute(xml: &str, name: &str) -> Option<String> {
    use quick_xml::Reader;
    use quick_xml::events::Event;

    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();
    let mut in_target_attr = false;

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                let local = String::from_utf8_lossy(e.name().local_name().as_ref()).to_string();
                if local == "Attribute" {
                    // Check if Name attribute matches
                    for attr in e.attributes().flatten() {
                        let key = String::from_utf8_lossy(attr.key.local_name().as_ref()).to_string();
                        if key == "Name" && String::from_utf8_lossy(&attr.value) == name {
                            in_target_attr = true;
                        }
                    }
                } else if local == "AttributeValue" && in_target_attr {
                    let mut text = String::new();
                    loop {
                        match reader.read_event_into(&mut buf) {
                            Ok(Event::Text(ref t)) => {
                                text.push_str(&t.unescape().unwrap_or_default());
                            }
                            Ok(Event::CData(ref c)) => {
                                text.push_str(&String::from_utf8_lossy(c));
                            }
                            Ok(Event::End(ref e)) => {
                                let end_local = String::from_utf8_lossy(e.name().local_name().as_ref()).to_string();
                                if end_local == "AttributeValue" {
                                    break;
                                }
                            }
                            Ok(Event::Eof) => break,
                            _ => {}
                        }
                    }
                    return Some(text);
                }
            }
            Ok(Event::End(ref e)) => {
                let local = String::from_utf8_lossy(e.name().local_name().as_ref()).to_string();
                if local == "Attribute" {
                    in_target_attr = false;
                }
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
        buf.clear();
    }

    None
}

// ── XML Name Matching ───────────────────────────────────────

/// Check if an XML name (possibly namespaced like `saml:NameID`) matches a local name (`NameID`).
///
/// `quick-xml` returns names with namespace prefix stripped for `name()` calls,
/// but we handle both cases for robustness.
pub fn local_name_matches(xml_name: quick_xml::name::QName<'_>, target: &str) -> bool {
    let local_name = xml_name.local_name();
    let local = String::from_utf8_lossy(local_name.as_ref());
    local.as_ref() == target
}

/// Check if XML contains an element with the given local name (namespace-agnostic).
pub fn xml_has_element(xml: &str, tag: &str) -> bool {
    extract_xml_text(xml, tag).is_some() || extract_xml_attribute(xml, tag, "").is_some()
}

// ── SAML Signature Verification ─────────────────────────────

/// Verify the cryptographic signature of a SAML response.
///
/// This performs RSA-SHA256 signature verification using the IdP's X.509 certificate.
/// Steps:
/// 1. Extract `<ds:SignatureValue>` from the XML
/// 2. Extract `<ds:SignedInfo>` from the XML
/// 3. Decode the SignatureValue from base64
/// 4. Extract the public key from the X.509 certificate
/// 5. Verify the RSA-SHA256 signature over the SignedInfo bytes
pub fn verify_saml_signature(xml: &str, certificate_pem: &str) -> Result<(), AppError> {
    use base64::Engine;

    // 1. Extract SignatureValue
    let sig_value_b64 = extract_xml_text(xml, "SignatureValue")
        .ok_or_else(|| AppError::coded(ErrorCode::SamlMissingSignature))?;
    let sig_bytes = base64::engine::general_purpose::STANDARD
        .decode(sig_value_b64.trim())
        .map_err(|_| AppError::coded(ErrorCode::SamlInvalidBase64))?;

    // 2. Extract SignedInfo (raw XML between <ds:SignedInfo> and </ds:SignedInfo>)
    let signed_info = extract_signed_info_xml(xml)
        .ok_or_else(|| AppError::coded(ErrorCode::SamlMissingSignedInfo))?;

    // 3. Extract public key from X.509 certificate
    let cert_der = extract_certificate_der(certificate_pem)?;
    let public_key = extract_rsa_public_key_from_der(&cert_der)?;

    // 4. Verify RSA-SHA256 signature
    use ring::signature;
    let public_key_ref = signature::UnparsedPublicKey::new(
        &signature::RSA_PKCS1_2048_8192_SHA256,
        &public_key,
    );

    public_key_ref
        .verify(signed_info.as_bytes(), &sig_bytes)
        .map_err(|e| {
            tracing::warn!("SAML signature verification failed: {}", e);
            AppError::coded(ErrorCode::SamlSignatureFailed)
        })?;

    tracing::debug!("SAML signature verified successfully");
    Ok(())
}

/// Extract the raw XML content of `<ds:SignedInfo>...</ds:SignedInfo>`
pub fn extract_signed_info_xml(xml: &str) -> Option<String> {
    use quick_xml::events::Event;
    use quick_xml::Reader;

    let mut reader = Reader::from_str(xml);
    let mut buf = Vec::new();
    let mut start_offset: Option<usize> = None;
    let mut depth: u32 = 0;

    loop {
        let offset = reader.buffer_position() as usize;
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                if local_name_matches(e.name(), "SignedInfo") {
                    start_offset = Some(offset);
                    depth = 1;
                } else if start_offset.is_some() {
                    depth += 1;
                }
            }
            Ok(Event::End(ref e)) => {
                if start_offset.is_some() {
                    if local_name_matches(e.name(), "SignedInfo") {
                        // Found the closing tag — extract raw XML including both tags
                        let end_offset = reader.buffer_position() as usize;
                        return Some(xml[start_offset.unwrap()..end_offset].to_string());
                    }
                    depth = depth.saturating_sub(1);
                    if depth == 0 {
                        start_offset = None;
                    }
                }
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
        buf.clear();
    }
    None
}

/// Extract DER-encoded certificate from PEM string
pub fn extract_certificate_der(pem: &str) -> Result<Vec<u8>, AppError> {
    use base64::Engine;
    let pem_clean = pem
        .replace("-----BEGIN CERTIFICATE-----", "")
        .replace("-----END CERTIFICATE-----", "")
        .replace('\n', "")
        .replace('\r', "")
        .replace(' ', "");

    base64::engine::general_purpose::STANDARD
        .decode(&pem_clean)
        .map_err(|_| AppError::coded(ErrorCode::SamlInvalidBase64))
}

/// Extract RSA public key from DER-encoded X.509 certificate
pub fn extract_rsa_public_key_from_der(der: &[u8]) -> Result<Vec<u8>, AppError> {
    let rsa_oid: &[u8] = &[0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01];

    let oid_pos = find_byte_sequence(der, rsa_oid)
        .ok_or_else(|| AppError::coded(ErrorCode::SamlInvalidCertificate))?;

    let mut pos = oid_pos + rsa_oid.len();

    // Skip NULL byte if present
    if pos < der.len() && der[pos] == 0x05 {
        pos += 2;
    }

    // Find BIT STRING (tag 0x03)
    while pos < der.len() {
        if der[pos] == 0x03 {
            pos += 1;
            let (len, bytes_read) = read_asn1_length(&der[pos..]);
            pos += bytes_read;

            // Skip the "unused bits" byte
            if pos < der.len() {
                pos += 1;
            }

            let key_end = pos + len - 1;
            if key_end <= der.len() {
                return Ok(der[pos..key_end].to_vec());
            }
        }
        pos += 1;
    }

    Err(AppError::coded(ErrorCode::SamlCertKeyError))
}

/// Find a byte sequence in a byte slice
pub fn find_byte_sequence(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|window| window == needle)
}

/// Read ASN.1 length encoding
pub fn read_asn1_length(data: &[u8]) -> (usize, usize) {
    if data.is_empty() {
        return (0, 0);
    }
    let first = data[0];
    if first & 0x80 == 0 {
        // Short form
        (first as usize, 1)
    } else {
        // Long form
        let num_bytes = (first & 0x7f) as usize;
        if num_bytes == 0 || data.len() < 1 + num_bytes {
            return (0, 0);
        }
        let mut length: usize = 0;
        for i in 0..num_bytes {
            length = (length << 8) | data[1 + i] as usize;
        }
        (length, 1 + num_bytes)
    }
}
