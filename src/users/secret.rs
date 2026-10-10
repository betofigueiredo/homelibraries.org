//! Random secrets for sign-in links and session cookies.
//! The secret goes to the user (in the email or the cookie); the database only keeps its hash,
//! so a leaked database can't be used to sign in.

use std::fmt::Write;

use sha2::{Digest, Sha256};

/// 32 random bytes as 64 hex characters.
#[must_use]
pub fn new_secret() -> String {
    hex(&rand::random::<[u8; 32]>())
}

/// SHA-256 of the secret, as hex. Secrets are random, so no salt is needed.
#[must_use]
pub fn hash_secret(secret: &str) -> String {
    hex(&Sha256::digest(secret.as_bytes()))
}

fn hex(bytes: &[u8]) -> String {
    bytes
        .iter()
        .fold(String::with_capacity(bytes.len() * 2), |mut out, b| {
            let _ = write!(out, "{b:02x}");
            out
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn secrets_are_random_and_hashes_stable() {
        let secret = new_secret();
        assert_eq!(secret.len(), 64);
        assert_ne!(secret, new_secret());
        assert_eq!(hash_secret(&secret), hash_secret(&secret));
        assert_ne!(hash_secret(&secret), secret);
    }
}
