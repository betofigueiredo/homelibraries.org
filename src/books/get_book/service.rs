use std::sync::Arc;

use crate::{
    books::{
        model::{Book, BookId},
        repository::BookRepository,
    },
    error::AppError,
    users::model::UserId,
};

pub struct GetBookService {
    books: Arc<dyn BookRepository>,
}

impl GetBookService {
    pub fn new(books: Arc<dyn BookRepository>) -> Self {
        Self { books }
    }

    /// `NotFound` also when the book is in another library.
    pub async fn execute(&self, owner: UserId, id: BookId) -> Result<Book, AppError> {
        self.books.get(owner, id).await?.ok_or(AppError::NotFound)
    }
}
