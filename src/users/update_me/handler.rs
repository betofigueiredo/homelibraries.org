use axum::{Json, extract::State};
use serde::Deserialize;

use super::service::{UpdateMeInput, UpdateMeService};
use crate::{
    auth::CurrentUser,
    error::AppError,
    state::AppState,
    users::model::{User, validate_display_name, validate_username},
};

/// Every field is optional; only the ones sent change.
#[derive(Debug, Deserialize)]
pub struct UpdateMeRequest {
    username: Option<String>,
    /// An empty string removes the display name.
    display_name: Option<String>,
}

impl UpdateMeRequest {
    fn validate(self) -> Result<UpdateMeInput, AppError> {
        Ok(UpdateMeInput {
            username: self
                .username
                .as_deref()
                .map(validate_username)
                .transpose()?,
            display_name: self
                .display_name
                .as_deref()
                .map(validate_display_name)
                .transpose()?,
        })
    }
}

/// Body: `{"username": "beto", "display_name": "Beto Figueiredo"}`.
pub async fn handler(
    current: CurrentUser,
    State(state): State<AppState>,
    Json(body): Json<UpdateMeRequest>,
) -> Result<Json<User>, AppError> {
    let input = body.validate()?;
    let user = UpdateMeService::new(state.users)
        .execute(current.user, input)
        .await?;
    Ok(Json(user))
}
