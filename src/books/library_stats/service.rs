use std::{collections::BTreeMap, sync::Arc};

use chrono::Datelike;
use schemars::JsonSchema;
use serde::Serialize;

use crate::{
    books::{
        model::{BookFilter, ReadingStatus},
        repository::BookRepository,
    },
    error::AppError,
    users::model::UserId,
};

#[derive(Debug, Default, Serialize, JsonSchema)]
pub struct LibraryStats {
    pub total: u32,
    pub read: u32,
    pub reading: u32,
    pub owned: u32,
    /// Books rated 5 stars.
    pub five_stars: u32,
    /// Year -> number of books finished that year (only books with a `date_read`).
    pub read_per_year: BTreeMap<i32, u32>,
}

pub struct LibraryStatsService {
    books: Arc<dyn BookRepository>,
}

impl LibraryStatsService {
    pub fn new(books: Arc<dyn BookRepository>) -> Self {
        Self { books }
    }

    pub async fn execute(&self, owner: UserId) -> Result<LibraryStats, AppError> {
        let books = self.books.search(&BookFilter::all(owner)).await?;

        let mut stats = LibraryStats::default();
        for book in books {
            stats.total += 1;
            match book.status {
                ReadingStatus::Reading => stats.reading += 1,
                ReadingStatus::Read => stats.read += 1,
            }
            if book.owned {
                stats.owned += 1;
            }
            if book.rating == Some(5) {
                stats.five_stars += 1;
            }
            if let Some(date) = book.date_read {
                *stats.read_per_year.entry(date.year()).or_default() += 1;
            }
        }
        Ok(stats)
    }
}
