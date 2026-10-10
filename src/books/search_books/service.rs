use std::sync::Arc;

use serde::Serialize;

use crate::{
    books::{
        model::{Book, BookFilter},
        repository::BookRepository,
    },
    error::AppError,
};

/// The matching books, sorted by title, and how many there are.
#[derive(Debug, Serialize)]
pub struct SearchBooksResult {
    pub books: Vec<Book>,
    pub total: usize,
}

pub struct SearchBooksService {
    books: Arc<dyn BookRepository>,
}

impl SearchBooksService {
    pub fn new(books: Arc<dyn BookRepository>) -> Self {
        Self { books }
    }

    pub async fn execute(&self, filter: &BookFilter) -> Result<SearchBooksResult, AppError> {
        let books = self.books.search(filter).await?;
        Ok(SearchBooksResult {
            total: books.len(),
            books,
        })
    }
}
