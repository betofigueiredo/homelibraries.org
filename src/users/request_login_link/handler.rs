use axum::{Json, extract::State, http::StatusCode};
use serde::Deserialize;

use super::service::RequestLoginLinkService;
use crate::{auth::SameOrigin, error::AppError, state::AppState, users::model::validate_email};

#[derive(Debug, Deserialize)]
pub struct RequestLoginLinkRequest {
    email: String,
}

impl RequestLoginLinkRequest {
    fn validate(self) -> Result<String, AppError> {
        validate_email(&self.email)
    }
}

/// Body: `{"email": "ada@mail.com"}`. Always 202 for a valid address: the response never says
/// whether an account exists.
pub async fn handler(
    _: SameOrigin,
    State(state): State<AppState>,
    Json(body): Json<RequestLoginLinkRequest>,
) -> Result<StatusCode, AppError> {
    let email = body.validate()?;
    RequestLoginLinkService::new(state.sessions, state.mailer)
        .execute(email, &state.public_url)
        .await?;
    Ok(StatusCode::ACCEPTED)
}
