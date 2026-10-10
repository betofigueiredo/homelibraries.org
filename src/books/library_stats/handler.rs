use axum::{Json, extract::State};

use super::service::{LibraryStats, LibraryStatsService};
use crate::{books::library::Library, error::AppError, state::AppState};

/// `/api/libraries/{username}/stats`.
pub async fn handler(
    Library(owner): Library,
    State(state): State<AppState>,
) -> Result<Json<LibraryStats>, AppError> {
    let library_stats = LibraryStatsService::new(state.books).execute(owner).await?;
    Ok(Json(library_stats))
}
