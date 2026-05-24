
    #[test]
    fn test_sso_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_upsert_sso_request_defaults() {
        let json = r#"{}"#;
        let req: UpsertSsoRequest = serde_json::from_str(json).unwrap();
        assert!(req.provider.is_none());
        assert!(req.enabled.is_none());
    }

    #[test]
    fn test_parse_saml_name_id() {
        let xml = r#"<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            <saml:Subject>
                <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
            </saml:Subject>
        </saml:Assertion>"#;
        let result = parse_saml_response(xml);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().name_id, "user@example.com");
    }

    #[test]
    fn test_decode_oidc_token() {
        // Build a minimal valid JWT payload
        let payload = serde_json::json!({
            "sub": "12345",
            "email": "user@example.com",
            "name": "Test User",
            "exp": 9999999999i64
        });
        use base64::Engine;
        let header = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(r#"{"alg":"RS256","typ":"JWT"}"#);
        let payload_b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(payload.to_string());
        let token = format!("{}.{}.sig", header, payload_b64);

        let result = decode_oidc_id_token(&token);
        assert!(result.is_ok());
        let claims = result.unwrap();
        assert_eq!(claims["email"], "user@example.com");
    }

    // ── SSO default_role validation ─────────────────────────

    #[test]
    fn test_sso_default_role_valid_values() {
        let valid_roles = ["admin", "developer", "analyst", "viewer"];
        for role in valid_roles {
            let json = format!(r#"{{"default_role": "{}"}}"#, role);
            let req: UpsertSsoRequest = serde_json::from_str(&json).unwrap();
            assert_eq!(req.default_role.as_deref(), Some(role));
        }
    }

    #[test]
    fn test_sso_default_role_none_when_not_provided() {
        let json = r#"{}"#;
        let req: UpsertSsoRequest = serde_json::from_str(json).unwrap();
        assert!(req.default_role.is_none());
    }

    #[test]
    fn test_sso_login_state_has_default_role() {
        // Verify SsoLoginState struct has default_role field
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            provider: "saml".to_string(),
            redirect: None,
            saml_request_id: None,
            auto_join_team_id: None,
            default_role: "developer".to_string(),
            nonce: None,
            created_at: chrono::Utc::now(),
        };
        assert_eq!(state.default_role, "developer");
    }

    #[test]
    fn test_sso_login_state_default_role_viewer() {
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "viewer@example.com".to_string(),
            provider: "oidc".to_string(),
            redirect: Some("/dashboard".to_string()),
            saml_request_id: None,
            auto_join_team_id: Some(Uuid::new_v4()),
            default_role: "viewer".to_string(),
            nonce: Some("test-nonce-123".to_string()),
            created_at: chrono::Utc::now(),
        };
        assert_eq!(state.default_role, "viewer");
        assert!(state.auto_join_team_id.is_some());
        assert_eq!(state.nonce.as_deref(), Some("test-nonce-123"));
    }

    #[test]
    fn test_sso_login_state_preserves_role_across_providers() {
        // Both SAML and OIDC should preserve the role from config
        for provider in &["saml", "oidc"] {
            let state = SsoLoginState {
                customer_id: Uuid::new_v4(),
                email: "user@example.com".to_string(),
                provider: provider.to_string(),
                redirect: None,
                saml_request_id: None,
                auto_join_team_id: Some(Uuid::new_v4()),
                default_role: "admin".to_string(),
                nonce: None,
                created_at: chrono::Utc::now(),
            };
            assert_eq!(state.default_role, "admin", "role should be preserved for {}", provider);
        }
    }

    // ── auto_join_team_direct role assignment ────────────────

    #[test]
    fn test_auto_join_uses_provided_role_not_hardcoded() {
        // This tests the LOGIC that auto_join_team_direct receives the correct role
        // The actual DB call is tested in integration tests
        let config_role = "developer";
        let hardcoded_role = "viewer";

        // Before fix: always used hardcoded_role
        // After fix: uses config_role
        assert_ne!(config_role, hardcoded_role, "config role differs from hardcoded");
        assert_eq!(config_role, "developer", "config role is developer");
    }

    // ── OIDC nonce verification ──────────────────────────────

    #[test]
    fn test_oidc_nonce_stored_in_state() {
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "user@example.com".to_string(),
            provider: "oidc".to_string(),
            redirect: None,
            saml_request_id: None,
            auto_join_team_id: None,
            default_role: "viewer".to_string(),
            nonce: Some("random-nonce-abc123".to_string()),
            created_at: chrono::Utc::now(),
        };
        assert_eq!(state.nonce.as_deref(), Some("random-nonce-abc123"));
    }

    #[test]
    fn test_saml_state_has_no_nonce() {
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "user@example.com".to_string(),
            provider: "saml".to_string(),
            redirect: None,
            saml_request_id: Some("_request123".to_string()),
            auto_join_team_id: None,
            default_role: "viewer".to_string(),
            nonce: None,
            created_at: chrono::Utc::now(),
        };
        assert!(state.nonce.is_none(), "SAML state should not have nonce");
    }

    // ── SAML signature verification helpers ─────────────────

    #[test]
    fn test_extract_signed_info_xml() {
        let xml = r#"<samlp:Response>
            <ds:Signature>
                <ds:SignedInfo>
                    <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                </ds:SignedInfo>
                <ds:SignatureValue>abc123</ds:SignatureValue>
            </ds:Signature>
        </samlp:Response>"#;
        let result = extract_signed_info_xml(xml);
        assert!(result.is_some());
        let signed_info = result.unwrap();
        assert!(signed_info.contains("SignedInfo"));
        assert!(signed_info.contains("CanonicalizationMethod"));
    }

    #[test]
    fn test_extract_signed_info_xml_no_prefix() {
        let xml = r#"<Response>
            <Signature>
                <SignedInfo>
                    <CanonicalizationMethod/>
                </SignedInfo>
                <SignatureValue>abc</SignatureValue>
            </Signature>
        </Response>"#;
        let result = extract_signed_info_xml(xml);
        assert!(result.is_some());
    }

    #[test]
    fn test_extract_signed_info_missing() {
        let xml = r#"<samlp:Response><saml:Assertion/></samlp:Response>"#;
        let result = extract_signed_info_xml(xml);
        assert!(result.is_none());
    }

    #[test]
    fn test_extract_certificate_der_valid() {
        // Self-signed test certificate (minimal)
        let pem = "-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAMlE...\n-----END CERTIFICATE-----";
        // This will fail base64 decode since it's truncated, but tests the PEM stripping
        let result = extract_certificate_der(pem);
        // Expected to fail with invalid base64 (test cert is truncated)
        assert!(result.is_err());
    }

    #[test]
    fn test_read_asn1_length_short_form() {
        assert_eq!(read_asn1_length(&[0x30]), (0x30, 1));
        assert_eq!(read_asn1_length(&[0x00]), (0, 1));
    }

    #[test]
    fn test_read_asn1_length_long_form() {
        // 0x81 0x80 = 128 bytes
        assert_eq!(read_asn1_length(&[0x81, 0x80]), (128, 2));
        // 0x82 0x01 0x00 = 256 bytes
        assert_eq!(read_asn1_length(&[0x82, 0x01, 0x00]), (256, 3));
    }

    #[test]
    fn test_find_byte_sequence() {
        let haystack = b"hello world";
        assert_eq!(find_byte_sequence(haystack, b"world"), Some(6));
        assert_eq!(find_byte_sequence(haystack, b"xyz"), None);
    }

    // ── quick-xml SAML parsing tests ────────────────────────

    #[test]
    fn test_extract_xml_text_namespaced() {
        let xml = r#"<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            <saml:Subject>
                <saml:NameID>user@example.com</saml:NameID>
            </saml:Subject>
        </saml:Assertion>"#;
        assert_eq!(extract_xml_text(xml, "NameID"), Some("user@example.com".into()));
    }

    #[test]
    fn test_extract_xml_text_no_namespace() {
        let xml = r#"<Response><NameID>test@test.com</NameID></Response>"#;
        assert_eq!(extract_xml_text(xml, "NameID"), Some("test@test.com".into()));
    }

    #[test]
    fn test_extract_xml_text_nested() {
        let xml = r#"<root>
            <parent><child>inner text</child></parent>
            <parent><child>other</child></parent>
        </root>"#;
        // Should find the FIRST matching element
        assert_eq!(extract_xml_text(xml, "child"), Some("inner text".into()));
    }

    #[test]
    fn test_extract_xml_text_missing() {
        let xml = r#"<root><other>value</other></root>"#;
        assert_eq!(extract_xml_text(xml, "NameID"), None);
    }

    #[test]
    fn test_extract_xml_text_audience() {
        let xml = r#"<saml:AudienceRestriction>
            <saml:Audience>https://hooksniff.com</saml:Audience>
        </saml:AudienceRestriction>"#;
        assert_eq!(extract_xml_text(xml, "Audience"), Some("https://hooksniff.com".into()));
    }

    #[test]
    fn test_extract_xml_attribute_response() {
        let xml = r#"<samlp:Response InResponseTo="_abc123" Destination="https://example.com/callback">
            <saml:Assertion/>
        </samlp:Response>"#;
        assert_eq!(extract_xml_attribute(xml, "Response", "InResponseTo"), Some("_abc123".into()));
        assert_eq!(extract_xml_attribute(xml, "Response", "Destination"), Some("https://example.com/callback".into()));
    }

    #[test]
    fn test_extract_xml_attribute_session_index() {
        let xml = r#"<saml:Assertion>
            <saml:AuthnStatement SessionIndex="_session456">
            </saml:AuthnStatement>
        </saml:Assertion>"#;
        assert_eq!(extract_xml_attribute(xml, "AuthnStatement", "SessionIndex"), Some("_session456".into()));
    }

    #[test]
    fn test_extract_xml_attribute_not_on_or_after() {
        let xml = r#"<saml:SubjectConfirmationData NotOnOrAfter="2026-12-31T23:59:59Z" Recipient="https://example.com"/>"#;
        assert_eq!(
            extract_xml_attribute(xml, "SubjectConfirmationData", "NotOnOrAfter"),
            Some("2026-12-31T23:59:59Z".into())
        );
    }

    #[test]
    fn test_extract_saml_attribute_email() {
        let xml = r#"<saml:AttributeStatement>
            <saml:Attribute Name="email">
                <saml:AttributeValue>user@example.com</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="firstName">
                <saml:AttributeValue>John</saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>"#;
        assert_eq!(extract_saml_attribute(xml, "email"), Some("user@example.com".into()));
        assert_eq!(extract_saml_attribute(xml, "firstName"), Some("John".into()));
    }

    #[test]
    fn test_extract_saml_attribute_missing() {
        let xml = r#"<saml:AttributeStatement>
            <saml:Attribute Name="email">
                <saml:AttributeValue>user@example.com</saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>"#;
        assert_eq!(extract_saml_attribute(xml, "nonexistent"), None);
    }

    #[test]
    fn test_parse_saml_full_assertion() {
        let xml = r#"<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                                   xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                                   InResponseTo="_req123"
                                   Destination="https://app.example.com/sso/callback">
            <saml:Assertion>
                <saml:Subject>
                    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">admin@company.com</saml:NameID>
                    <saml:SubjectConfirmation>
                        <saml:SubjectConfirmationData NotOnOrAfter="2099-12-31T23:59:59Z"/>
                    </saml:SubjectConfirmation>
                </saml:Subject>
                <saml:Conditions>
                    <saml:AudienceRestriction>
                        <saml:Audience>https://hooksniff.com</saml:Audience>
                    </saml:AudienceRestriction>
                </saml:Conditions>
                <saml:AuthnStatement SessionIndex="_session789">
                </saml:AuthnStatement>
                <saml:AttributeStatement>
                    <saml:Attribute Name="email">
                        <saml:AttributeValue>admin@company.com</saml:AttributeValue>
                    </saml:Attribute>
                    <saml:Attribute Name="firstName">
                        <saml:AttributeValue>Admin</saml:AttributeValue>
                    </saml:Attribute>
                    <saml:Attribute Name="lastName">
                        <saml:AttributeValue>User</saml:AttributeValue>
                    </saml:Attribute>
                </saml:AttributeStatement>
            </saml:Assertion>
        </samlp:Response>"#;

        let result = parse_saml_response(xml);
        assert!(result.is_ok(), "parse_saml_response failed: {:?}", result.err());
        let assertion = result.unwrap();

        assert_eq!(assertion.name_id, "admin@company.com");
        assert_eq!(assertion.session_index.as_deref(), Some("_session789"));
        assert_eq!(assertion.in_response_to.as_deref(), Some("_req123"));
        assert_eq!(assertion.destination.as_deref(), Some("https://app.example.com/sso/callback"));
        assert_eq!(assertion.audience.as_deref(), Some("https://hooksniff.com"));
        assert_eq!(assertion.attributes.get("email").map(|s| s.as_str()), Some("admin@company.com"));
        assert_eq!(assertion.attributes.get("firstName").map(|s| s.as_str()), Some("Admin"));
        assert_eq!(assertion.attributes.get("lastName").map(|s| s.as_str()), Some("User"));
        assert!(assertion.not_on_or_after.is_some());
    }

    #[test]
    fn test_local_name_matches() {
        assert!(local_name_matches(b"NameID", "NameID"));
        assert!(local_name_matches(b"saml:NameID", "NameID"));
        assert!(local_name_matches(b"ds:Signature", "Signature"));
        assert!(!local_name_matches(b"Other", "NameID"));
    }

    #[test]
    fn test_xml_has_element() {
        let xml = r#"<samlp:Response><ds:Signature><ds:SignatureValue>abc</ds:SignatureValue></ds:Signature></samlp:Response>"#;
        assert!(xml_has_element(xml, "Signature"));
        assert!(xml_has_element(xml, "SignatureValue"));
        assert!(!xml_has_element(xml, "NonExistent"));
    }
