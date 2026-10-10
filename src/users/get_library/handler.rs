use axum::{
    Json,
    extract::{Path, State},
};

use super::service::{GetLibraryService, LibraryProfile};
use crate::{error::AppError, state::AppState};

/// `/api/libraries/{username}`: whose library this is. Usernames are stored lowercase.
pub async fn handler(
    State(state): State<AppState>,
    Path(username): Path<String>,
) -> Result<Json<LibraryProfile>, AppError> {
    let profile = GetLibraryService::new(state.users)
        .execute(&username.to_lowercase())
        .await?;
    Ok(Json(profile))
}
