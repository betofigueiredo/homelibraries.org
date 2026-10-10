use std::{cmp::Ordering, collections::HashMap};

use async_trait::async_trait;
use tokio::sync::RwLock;

use super::BookRepository;
use crate::{
    books::model::{Book, BookFilter, BookId, SortBy, Source},
    error::AppError,
    users::model::UserId,
};

/// Mock persistence for tests: keeps everything in memory, lost on restart.
#[derive(Default)]
pub struct InMemoryBookRepository {
    books: RwLock<HashMap<BookId, Book>>,
}

#[async_trait]
impl BookRepository for InMemoryBookRepository {
    async fn get(&self, user_id: UserId, id: BookId) -> Result<Option<Book>, AppError> {
        let books = self.books.read().await;
        Ok(books.get(&id).filter(|b| b.user_id == user_id).cloned())
    }

    async fn search(&self, filter: &BookFilter) -> Result<Vec<Book>, AppError> {
        let needle = filter.text.as_deref().map(str::to_lowercase);
        let mut books: Vec<Book> = self
            .books
            .read()
            .await
            .values()
            .filter(|b| b.user_id == filter.user_id)
            .filter(|b| needle.as_deref().is_none_or(|n| b.matches_text(n)))
            .filter(|b| filter.status.is_none_or(|s| b.status == s))
            .filter(|b| filter.owned.is_none_or(|o| b.owned == o))
            .cloned()
            .collect();
        books.sort_by(|a, b| {
            let first = match filter.sort {
                SortBy::Title => Ordering::Equal,
                SortBy::Author => a.author.cmp(&b.author),
                // Reversed for newest first. `None` is smallest, so unfinished books end up last.
                SortBy::DateRead => b.date_read.cmp(&a.date_read),
            };
            first.then_with(|| a.title.cmp(&b.title))
        });
        Ok(books)
    }

    async fn find_by_external_id(
        &self,
        user_id: UserId,
        source: Source,
        external_id: &str,
    ) -> Result<Option<Book>, AppError> {
        Ok(self
            .books
            .read()
            .await
            .values()
            .find(|b| b.user_id == user_id && b.source == source && b.external_id == external_id)
            .cloned())
    }

    async fn insert(&self, book: &Book) -> Result<(), AppError> {
        self.books.write().await.insert(book.id, book.clone());
        Ok(())
    }

    async fn update(&self, book: &Book) -> Result<(), AppError> {
        self.books.write().await.insert(book.id, book.clone());
        Ok(())
    }

    async fn delete(&self, id: BookId) -> Result<(), AppError> {
        self.books.write().await.remove(&id);
        Ok(())
    }
}
