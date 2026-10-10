use axum::{
    Json,
    extract::{Query, State},
};
use schemars::JsonSchema;
use serde::Deserialize;

use super::service::{SearchBooksResult, SearchBooksService};
use crate::{
    books::{
        library::Library,
        model::{BookFilter, ReadingStatus, SortBy},
    },
    error::AppError,
    state::AppState,
    users::model::UserId,
};

/// Query string: `?q=dune&status=read&owned=true&sort=author`. Every field is optional.
#[derive(Debug, Deserialize, JsonSchema)]
pub struct SearchBooksRequest {
    /// Text to find in the title or author (case-insensitive).
    q: Option<String>,
    /// `read` or `reading`.
    status: Option<ReadingStatus>,
    /// `true`: only books the reader owns. `false`: only books they don't.
    owned: Option<bool>,
    /// `title` (default), `author` or `date_read`.
    #[serde(default)]
    sort: SortBy,
}

impl SearchBooksRequest {
    pub(crate) fn validate(self, owner: UserId) -> BookFilter {
        // A blank `q` means "no text filter", not "match nothing".
        let text = self
            .q
            .map(|q| q.trim().to_owned())
            .filter(|q| !q.is_empty());
        BookFilter {
            user_id: owner,
            text,
            status: self.status,
            owned: self.owned,
            sort: self.sort,
        }
    }
}

/// `/api/libraries/{username}/books`.
pub async fn handler(
    Library(owner): Library,
    State(state): State<AppState>,
    Query(query): Query<SearchBooksRequest>,
) -> Result<Json<SearchBooksResult>, AppError> {
    let filter = query.validate(owner);
    let result = SearchBooksService::new(state.books)
        .execute(&filter)
        .await?;
    Ok(Json(result))
}
