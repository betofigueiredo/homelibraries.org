mod in_memory;
mod sqlite;

use async_trait::async_trait;
pub use in_memory::InMemoryBookRepository;
pub use sqlite::SqliteBookRepository;

use super::model::{Book, BookFilter, BookId, Source};
use crate::{error::AppError, users::model::UserId};

/// Persistence port for books. Every read is scoped to one library (`user_id`),
/// so one person's books never show up in another's.
#[async_trait]
pub trait BookRepository: Send + Sync {
    async fn get(&self, user_id: UserId, id: BookId) -> Result<Option<Book>, AppError>;
    async fn search(&self, filter: &BookFilter) -> Result<Vec<Book>, AppError>;
    async fn find_by_external_id(
        &self,
        user_id: UserId,
        source: Source,
        external_id: &str,
    ) -> Result<Option<Book>, AppError>;
    async fn insert(&self, book: &Book) -> Result<(), AppError>;
    /// Replaces the stored book that has the same id.
    async fn update(&self, book: &Book) -> Result<(), AppError>;
    /// Does nothing if there is no book with this id.
    async fn delete(&self, id: BookId) -> Result<(), AppError>;
}
