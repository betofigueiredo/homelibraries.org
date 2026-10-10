//! Who is calling. Libraries are public, so reads need nothing.
//! Changes need a signed-in user: the `session` cookie set by `verify_login`.
//! Only the hash of the cookie is stored (see `users::secret`).

use axum::{
    extract::FromRequestParts,
    http::{HeaderMap, HeaderValue, header, request::Parts},
};
use chrono::Utc;

use crate::{
    error::AppError,
    state::AppState,
    users::{model::User, secret::hash_secret},
};

const SESSION_COOKIE: &str = "session";
/// How long a sign-in lasts.
pub const SESSION_DAYS: i64 = 120;

/// Rejects requests sent by another website's page (a CSRF attack), with 403.
/// Browsers always send `Origin` on POST/PATCH/DELETE; it must be this app's `public_url`.
/// Requests without `Origin` (curl, tests) carry no browser cookies by accident, so they pass.
pub struct SameOrigin;

impl FromRequestParts<AppState> for SameOrigin {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, AppError> {
        check_same_origin(parts, state)?;
        Ok(Self)
    }
}

fn check_same_origin(parts: &Parts, state: &AppState) -> Result<(), AppError> {
    if parts.method.is_safe() {
        return Ok(());
    }
    match parts.headers.get(header::ORIGIN) {
        Some(origin) if origin.as_bytes() != state.public_url.as_bytes() => {
            Err(AppError::Forbidden)
        }
        _ => Ok(()),
    }
}

/// Add this as an argument of a handler that needs a signed-in user.
/// Without a valid session cookie the request is rejected with 401 before the body is read.
pub struct CurrentUser {
    pub user: User,
    /// Hash of the cookie, so `logout` can end this session only.
    pub session_hash: String,
}

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, AppError> {
        check_same_origin(parts, state)?;
        let secret = session_secret(&parts.headers).ok_or(AppError::Unauthorized)?;
        let session_hash = hash_secret(secret);
        let user_id = state
            .sessions
            .find_session(&session_hash, Utc::now())
            .await?
            .ok_or(AppError::Unauthorized)?;
        // A session outlives nothing: users are deleted with their sessions (ON DELETE CASCADE).
        let user = state
            .users
            .get(user_id)
            .await?
            .ok_or(AppError::Unauthorized)?;
        Ok(Self { user, session_hash })
    }
}

/// The value of the `session` cookie, if the request has one.
fn session_secret(headers: &HeaderMap) -> Option<&str> {
    headers
        .get_all(header::COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok())
        .flat_map(|value| value.split(';'))
        .find_map(|pair| {
            let (name, value) = pair.trim().split_once('=')?;
            (name == SESSION_COOKIE).then_some(value)
        })
}

/// `Set-Cookie` that signs this browser in. JavaScript can't read it (`HttpOnly`),
/// other sites' forms don't send it (`SameSite=Lax`), and on https it never travels in clear text.
///
/// # Panics
/// Never: secrets are hex, so the header is always valid.
#[must_use]
pub fn session_cookie(state: &AppState, secret: &str) -> HeaderValue {
    let max_age = SESSION_DAYS * 24 * 60 * 60;
    cookie(
        state,
        &format!("{SESSION_COOKIE}={secret}; Max-Age={max_age}"),
    )
}

/// `Set-Cookie` that signs this browser out.
#[must_use]
pub fn clear_session_cookie(state: &AppState) -> HeaderValue {
    cookie(state, &format!("{SESSION_COOKIE}=; Max-Age=0"))
}

fn cookie(state: &AppState, value: &str) -> HeaderValue {
    let secure = if state.public_url.starts_with("https://") {
        "; Secure"
    } else {
        ""
    };
    HeaderValue::from_str(&format!("{value}; Path=/; HttpOnly; SameSite=Lax{secure}"))
        .expect("cookie values are ASCII")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_the_session_among_other_cookies() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            "theme=dark; session=abc123; x=1".parse().unwrap(),
        );
        assert_eq!(session_secret(&headers), Some("abc123"));

        headers.insert(header::COOKIE, "sessionx=nope".parse().unwrap());
        assert_eq!(session_secret(&headers), None);
    }

    #[test]
    fn cookie_is_secure_only_on_https() {
        let local = AppState::in_memory();
        assert!(
            !session_cookie(&local, "s")
                .to_str()
                .unwrap()
                .contains("Secure")
        );

        let public = AppState {
            public_url: "https://homelibraries.org".into(),
            ..AppState::in_memory()
        };
        let cookie = session_cookie(&public, "s");
        let cookie = cookie.to_str().unwrap();
        assert!(cookie.contains("HttpOnly") && cookie.contains("SameSite=Lax"));
        assert!(cookie.ends_with("; Secure"));
    }
}
