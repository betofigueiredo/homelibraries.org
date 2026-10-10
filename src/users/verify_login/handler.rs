use axum::{
    Json,
    extract::State,
    http::header,
    response::{IntoResponse, Response},
};
use serde::Deserialize;

use super::service::VerifyLoginService;
use crate::{
    auth::{SameOrigin, session_cookie},
    error::AppError,
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct VerifyLoginRequest {
    /// The `token` from the sign-in link.
    token: String,
}

impl VerifyLoginRequest {
    fn validate(self) -> Result<String, AppError> {
        let token = self.token.trim();
        if token.is_empty() {
            return Err(AppError::BadRequest("the sign-in link has no token".into()));
        }
        Ok(token.to_owned())
    }
}

/// Body: `{"token": "..."}`. Sets the session cookie and returns the user.
/// A user without a `username` still has to pick one (the onboarding page).
pub async fn handler(
    _: SameOrigin,
    State(state): State<AppState>,
    Json(body): Json<VerifyLoginRequest>,
) -> Result<Response, AppError> {
    let token = body.validate()?;
    let signed_in = VerifyLoginService::new(state.users.clone(), state.sessions.clone())
        .execute(&token)
        .await?;
    let cookie = session_cookie(&state, &signed_in.session_secret);
    Ok(([(header::SET_COOKIE, cookie)], Json(signed_in.user)).into_response())
}
