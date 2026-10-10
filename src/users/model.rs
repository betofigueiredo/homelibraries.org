use chrono::{DateTime, Utc};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;

/// Strongly typed id so a random `Uuid` can't be passed where a user id is expected.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, JsonSchema)]
#[serde(transparent)]
pub struct UserId(pub Uuid);

impl UserId {
    #[must_use]
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl Default for UserId {
    fn default() -> Self {
        Self::new()
    }
}

/// Someone with a library. Created the first time they follow a sign-in link.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct User {
    pub id: UserId,
    /// Private: only used to send sign-in links, never shown on the library.
    pub email: String,
    /// The library's address: `homelibraries.org/{username}`. `None` until they pick one.
    pub username: Option<String>,
    /// Shown as "`display_name`'s library".
    pub display_name: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// A sign-in link that hasn't been used yet. Only the hash of its secret is stored.
#[derive(Debug, Clone, PartialEq)]
pub struct LoginToken {
    pub token_hash: String,
    pub email: String,
    pub expires_at: DateTime<Utc>,
}

/// A signed-in browser. The cookie holds the secret; only its hash is stored.
#[derive(Debug, Clone, PartialEq)]
pub struct Session {
    pub id_hash: String,
    pub user_id: UserId,
    pub expires_at: DateTime<Utc>,
}

/// Usernames that would clash with the app's own routes (`/api`, `/signin`...).
const RESERVED_USERNAMES: [&str; 14] = [
    "api",
    "mcp",
    "assets",
    "auth",
    "signin",
    "signup",
    "import",
    "settings",
    "onboarding",
    "health",
    "admin",
    "about",
    "help",
    "www",
];

/// Trimmed and lowercased; must look like `name@domain.tld`.
///
/// # Errors
/// `BadRequest` if it doesn't.
pub fn validate_email(email: &str) -> Result<String, AppError> {
    let email = email.trim().to_lowercase();
    let valid = email.len() <= 254
        && !email.chars().any(char::is_whitespace)
        && email.split_once('@').is_some_and(|(local, domain)| {
            !local.is_empty()
                && !domain.contains('@')
                && domain.split('.').count() >= 2
                && domain.split('.').all(|part| !part.is_empty())
        });
    if valid {
        Ok(email)
    } else {
        Err(AppError::BadRequest("enter a valid email address".into()))
    }
}

/// 3 to 30 lowercase letters, digits and dashes, not starting or ending with a dash.
///
/// # Errors
/// `BadRequest` if it isn't, `Conflict` if it is reserved for the app's own pages.
pub fn validate_username(username: &str) -> Result<String, AppError> {
    let username = username.trim().to_lowercase();
    let allowed = |c: char| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-';
    if !(3..=30).contains(&username.len())
        || !username.chars().all(allowed)
        || username.starts_with('-')
        || username.ends_with('-')
    {
        return Err(AppError::BadRequest(
            "usernames have 3 to 30 lowercase letters, digits or dashes".into(),
        ));
    }
    if RESERVED_USERNAMES.contains(&username.as_str()) {
        return Err(AppError::Conflict(format!("`{username}` is taken")));
    }
    Ok(username)
}

/// Trimmed; empty means "no display name".
///
/// # Errors
/// `BadRequest` if it is longer than 80 characters.
pub fn validate_display_name(name: &str) -> Result<Option<String>, AppError> {
    let name = name.trim();
    if name.chars().count() > 80 {
        return Err(AppError::BadRequest(
            "the name can have up to 80 characters".into(),
        ));
    }
    Ok((!name.is_empty()).then(|| name.to_owned()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn emails_are_normalized_and_checked() {
        assert_eq!(validate_email(" Ada@Mail.com ").unwrap(), "ada@mail.com");
        for bad in [
            "",
            "ada",
            "ada@",
            "@mail.com",
            "ada@mail",
            "a da@mail.com",
            "a@b@c.com",
        ] {
            assert!(validate_email(bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn usernames_are_slugs_and_not_reserved() {
        assert_eq!(validate_username(" Beto ").unwrap(), "beto");
        assert_eq!(validate_username("ana-maria2").unwrap(), "ana-maria2");
        for bad in ["ab", "-beto", "beto-", "be to", "béto", &"a".repeat(31)] {
            assert!(
                matches!(validate_username(bad), Err(AppError::BadRequest(_))),
                "{bad}"
            );
        }
        assert!(matches!(
            validate_username("api"),
            Err(AppError::Conflict(_))
        ));
    }

    #[test]
    fn blank_display_name_is_none() {
        assert_eq!(validate_display_name("  ").unwrap(), None);
        assert_eq!(
            validate_display_name(" Beto ").unwrap(),
            Some("Beto".into())
        );
        assert!(validate_display_name(&"x".repeat(81)).is_err());
    }
}
