use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub fn compute_hmac(secret: &str, payload: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

pub fn verify_hmac(secret: &str, payload: &str, expected_signature: &str) -> bool {
    let computed = compute_hmac(secret, payload);
    // Constant-time comparison
    computed == expected_signature
}
