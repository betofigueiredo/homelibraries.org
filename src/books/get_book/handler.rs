use axum::{
    Json,
    extract::{Path, State},
};

use super::service::GetBookService;
use crate::{
    books::{
        library::Library,
        model::{Book, BookId},
    },
    error::AppError,
    state::AppState,
};

/// `/api/libraries/{username}/books/{id}`. `BookId` already rejects ids that aren't valid UUIDs (400).
pub async fn handler(
    Library(owner): Library,
    State(state): State<AppState>,
    Path((_, id)): Path<(String, BookId)>,
) -> Result<Json<Book>, AppError> {
    let book = GetBookService::new(state.books).execute(owner, id).await?;
    Ok(Json(book))
}
