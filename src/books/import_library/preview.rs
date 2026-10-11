use axum::{Json, extract::Multipart};
use serde::Serialize;

use super::{
    formats::{self, SkippedRow},
    handler::read_upload,
    service::ImportedBook,
};
use crate::{
    auth::CurrentUser,
    books::model::{ReadingStatus, Source},
    error::AppError,
};

/// How many books the preview lists.
const SAMPLE_SIZE: usize = 10;

/// What importing the file would do, before anything is written.
#[derive(Serialize)]
pub struct ImportPreview {
    source: Source,
    /// Read and currently-reading books.
    to_import: usize,
    /// Books on the to-read shelf; the user chooses whether to import them.
    to_read: usize,
    /// Books on other shelves (abandoned, …), left out on purpose.
    ignored: u32,
    skipped: usize,
    /// The first read and currently-reading books.
    sample: Vec<ImportedBook>,
    /// Why each skipped row was skipped.
    errors: Vec<SkippedRow>,
}

/// Same body as the import (`include_to_read` is ignored). Only parses: the UI keeps the file and sends it again to import.
pub async fn handler(
    _: CurrentUser,
    mut multipart: Multipart,
) -> Result<Json<ImportPreview>, AppError> {
    let file = formats::parse(&read_upload(&mut multipart).await?.csv)?;
    let to_read = file.to_read();
    Ok(Json(ImportPreview {
        source: file.source,
        to_import: file.books.len() - to_read,
        to_read,
        ignored: file.ignored,
        skipped: file.skipped.len(),
        sample: file
            .books
            .into_iter()
            .filter(|b| b.status != ReadingStatus::ToRead)
            .take(SAMPLE_SIZE)
            .collect(),
        errors: file.skipped,
    }))
}
