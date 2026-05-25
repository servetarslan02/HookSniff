# 2026-05-22 — SAML XML Parsing Refactor (quick-xml)

## Özet
SAML response parsing'deki string-based XML extraction quick-xml crate ile değiştirildi.

## Yapılan İşler
1. **quick-xml 0.37 eklendi** — workspace + api Cargo.toml
2. **5 fonksiyon yeniden yazıldı:**
   - `extract_xml_text` — namespace-agnostic element text extraction
   - `extract_xml_attribute` — proper attribute lookup via quick-xml events
   - `extract_saml_attribute` — SAML AttributeValue by Name attribute
   - `extract_signed_info_xml` — raw XML extraction for signature verification
   - `xml_has_element` — replaces string `.contains()` check
3. **2 yeni helper:**
   - `local_name_matches` — handles `saml:NameID` → `NameID` matching
   - `xml_has_element` — quick-xml based element existence check
4. **12 yeni test eklendi** — tüm parsing fonksiyonları için kapsamlı testler

## Neden Önemli
- Eski string-based parsing kırılgandı (whitespace, attribute order, nested elements)
- Namespace handling artık doğru (saml:, saml2p:, md:, ds: hepsini destekler)
- XML injection riski azaldı (proper parser ile)
- Signature verification daha güvenilir

## Değişen Dosyalar
- `Cargo.toml` — quick-xml workspace dep
- `api/Cargo.toml` — quick-xml api dep
- `api/src/routes/sso.rs` — 5 fonksiyon rewrite + 2 helper + 12 test

## Commit
`c1b168d8` — refactor(sso): replace string-based XML parsing with quick-xml
