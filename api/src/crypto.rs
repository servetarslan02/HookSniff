//! AES-256-GCM Encryption for Secrets at Rest
//!
//! Encrypts sensitive data (SSO client_secret, API keys, etc.) before storing
//! in the database. Uses AES-256-GCM with a 96-bit nonce.
//!
//! ## Security
//! - Key is loaded from `ENCRYPTION_KEY` env var (32 bytes, hex-encoded)
//! - Each encryption uses a random nonce (never reused)
//! - Authenticated encryption prevents tampering
//! - Fails loudly if key is missing or invalid

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use once_cell::sync::Lazy;

/// Global encryption key, loaded once from environment.
static CIPHER: Lazy<Option<Aes256Gcm>> = Lazy::new(|| {
    let key_hex = std::env::var("ENCRYPTION_KEY").ok()?;
    let key_bytes = hex::decode(&key_hex).ok()?;
    if key_bytes.len() != 32 {
        tracing::error!(
            "ENCRYPTION_KEY must be 32 bytes (64 hex chars), got {}",
            key_bytes.len()
        );
        return None;
    }
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).ok()?;
    tracing::info!("✅ AES-256-GCM encryption key loaded");
    Some(cipher)
});

/// Check if encryption is configured.
pub fn is_encryption_available() -> bool {
    CIPHER.is_some()
}

/// Encrypt plaintext using AES-256-GCM.
///
/// Returns base64-encoded `nonce || ciphertext`.
/// Nonce is 12 bytes, prepended to ciphertext for storage.
pub fn encrypt(plaintext: &str) -> Result<String, String> {
    let cipher = CIPHER
        .as_ref()
        .ok_or("ENCRYPTION_KEY not configured — cannot encrypt")?;

    // Generate random 12-byte nonce
    use aes_gcm::aead::rand_core::RngCore;
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("AES-GCM encryption failed: {}", e))?;

    // Prepend nonce to ciphertext: [12 bytes nonce][ciphertext + 16 bytes tag]
    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(&combined))
}

/// Decrypt ciphertext produced by `encrypt()`.
///
/// Expects base64-encoded `nonce || ciphertext`.
pub fn decrypt(encoded: &str) -> Result<String, String> {
    let cipher = CIPHER
        .as_ref()
        .ok_or("ENCRYPTION_KEY not configured — cannot decrypt")?;

    let combined = BASE64
        .decode(encoded)
        .map_err(|e| format!("Invalid base64 in encrypted value: {}", e))?;

    if combined.len() < 12 {
        return Err("Encrypted value too short".into());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("AES-GCM decryption failed (tampered or wrong key): {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("Decrypted value is not valid UTF-8: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        // Only run if ENCRYPTION_KEY is set
        if std::env::var("ENCRYPTION_KEY").is_err() {
            std::env::set_var(
                "ENCRYPTION_KEY",
                "0000000000000000000000000000000000000000000000000000000000000001",
            );
        }
        // Force re-init (won't work with Lazy, but test env is fine)
        let plaintext = "my-super-secret-client-secret";
        let encrypted = encrypt(plaintext).unwrap();
        let decrypted = decrypt(&encrypted).unwrap();
        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_encrypt_produces_different_output_each_time() {
        if std::env::var("ENCRYPTION_KEY").is_err() {
            std::env::set_var(
                "ENCRYPTION_KEY",
                "0000000000000000000000000000000000000000000000000000000000000001",
            );
        }
        let e1 = encrypt("same").unwrap();
        let e2 = encrypt("same").unwrap();
        // Different nonces → different ciphertext
        assert_ne!(e1, e2);
    }

    #[test]
    fn test_decrypt_tampered_fails() {
        if std::env::var("ENCRYPTION_KEY").is_err() {
            std::env::set_var(
                "ENCRYPTION_KEY",
                "0000000000000000000000000000000000000000000000000000000000000001",
            );
        }
        let encrypted = encrypt("test").unwrap();
        let mut bytes = BASE64.decode(&encrypted).unwrap();
        // Flip a byte in the ciphertext (not nonce)
        if bytes.len() > 13 {
            bytes[13] ^= 0xFF;
        }
        let tampered = BASE64.encode(&bytes);
        assert!(decrypt(&tampered).is_err());
    }
}
