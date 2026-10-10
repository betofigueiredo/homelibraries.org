use axum::{Json, extract::Multipart};
use serde::Serialize;

use super::{
    formats::{self, SkippedRow},
    handler::read_file_field,
    service::ImportedBook,
};
use crate::{auth::CurrentUser, books::model::Source, error::AppError};

/// How many books the preview lists.
const SAMPLE_SIZE: usize = 10;

/// What importing the file would do, before anything is written.
#[derive(Serialize)]
pub struct ImportPreview {
    source: Source,
    /// Read and currently-reading books.
    to_import: usize,
    /// Books on other shelves (to-read, abandoned, …), left out on purpose.
    ignored: u32,
    skipped: usize,
    /// The first books that would be imported.
    sample: Vec<ImportedBook>,
    /// Why each skipped row was skipped.
    errors: Vec<SkippedRow>,
}

/// Same body as the import. Only parses: the UI keeps the file and sends it again to import.
pub async fn handler(
    _: CurrentUser,
    mut multipart: Multipart,
) -> Result<Json<ImportPreview>, AppError> {
    let csv = read_file_field(&mut multipart).await?;
    let file = formats::parse(&csv)?;
    Ok(Json(ImportPreview {
        source: file.source,
        to_import: file.books.len(),
        ignored: file.ignored,
        skipped: file.skipped.len(),
        sample: file.books.into_iter().take(SAMPLE_SIZE).collect(),
        errors: file.skipped,
    }))
}
