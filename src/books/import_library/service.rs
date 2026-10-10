use std::{collections::HashSet, sync::Arc};

use chrono::NaiveDate;
use serde::Serialize;

use crate::{
    books::{
        model::{Book, BookFilter, BookId, ReadingStatus, Source},
        repository::BookRepository,
    },
    error::AppError,
    users::model::UserId,
};

/// One valid row of an export file.
#[derive(Debug, Serialize)]
pub struct ImportedBook {
    /// The book's id in the export's service, so re-importing updates instead of duplicating.
    #[serde(skip)]
    pub external_id: String,
    pub title: String,
    pub author: String,
    pub isbn13: Option<String>,
    pub pages: Option<u32>,
    pub year_published: Option<i32>,
    pub owned: bool,
    pub status: ReadingStatus,
    pub rating: Option<u8>,
    pub date_read: Option<NaiveDate>,
}

pub struct ImportLibraryInput {
    /// The service the file was exported from.
    pub source: Source,
    pub books: Vec<ImportedBook>,
    /// Rows the handler couldn't parse; reported back to the caller.
    pub skipped: u32,
    /// Rows on a shelf other than read or currently-reading (to-read, custom ones).
    pub ignored: u32,
    /// External ids of the imported and skipped rows. Stored books from `source` whose id is
    /// not here are deleted, so a skipped row never deletes its book, and an ignored one does.
    pub ids_in_file: HashSet<String>,
}

#[derive(Debug, Serialize)]
pub struct ImportSummary {
    pub source: Source,
    pub created: u32,
    pub updated: u32,
    /// Already imported with the same values, so nothing was written.
    pub unchanged: u32,
    pub skipped: u32,
    pub ignored: u32,
    /// Stored but no longer in the file.
    pub deleted: u32,
}

pub struct ImportLibraryService {
    books: Arc<dyn BookRepository>,
}

impl ImportLibraryService {
    pub fn new(books: Arc<dyn BookRepository>) -> Self {
        Self { books }
    }

    /// The file is the only source of truth for the owner's books from its source: afterwards
    /// their library holds exactly the file's read and reading books (other sources' stay).
    /// Matches books by external id, so importing the same file twice creates no duplicates.
    /// A matched book takes every field from the file, and is only written when one changed.
    pub async fn execute(
        &self,
        owner: UserId,
        input: ImportLibraryInput,
    ) -> Result<ImportSummary, AppError> {
        let mut summary = ImportSummary {
            source: input.source,
            created: 0,
            updated: 0,
            unchanged: 0,
            skipped: input.skipped,
            ignored: input.ignored,
            deleted: 0,
        };

        for book in self.books.search(&BookFilter::all(owner)).await? {
            let in_file =
                book.source != input.source || input.ids_in_file.contains(&book.external_id);
            if !in_file {
                self.books.delete(book.id).await?;
                summary.deleted += 1;
            }
        }

        for imported in input.books {
            let existing = self
                .books
                .find_by_external_id(owner, input.source, &imported.external_id)
                .await?;
            if let Some(existing) = existing {
                let book = to_book(existing.id, owner, input.source, imported);
                if book == existing {
                    summary.unchanged += 1;
                } else {
                    self.books.update(&book).await?;
                    summary.updated += 1;
                }
            } else {
                let book = to_book(BookId::new(), owner, input.source, imported);
                self.books.insert(&book).await?;
                summary.created += 1;
            }
        }
        Ok(summary)
    }
}

fn to_book(id: BookId, owner: UserId, source: Source, imported: ImportedBook) -> Book {
    Book {
        id,
        user_id: owner,
        title: imported.title,
        author: imported.author,
        isbn13: imported.isbn13,
        pages: imported.pages,
        year_published: imported.year_published,
        owned: imported.owned,
        status: imported.status,
        rating: imported.rating,
        date_read: imported.date_read,
        source,
        external_id: imported.external_id,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::books::repository::InMemoryBookRepository;

    fn imported(owned: bool, rating: u8) -> ImportedBook {
        ImportedBook {
            external_id: "1".into(),
            title: "Dune".into(),
            author: "Frank Herbert".into(),
            isbn13: None,
            pages: None,
            year_published: None,
            owned,
            status: ReadingStatus::Read,
            rating: Some(rating),
            date_read: None,
        }
    }

    fn input(books: Vec<ImportedBook>) -> ImportLibraryInput {
        ImportLibraryInput {
            source: Source::Goodreads,
            ids_in_file: books.iter().map(|b| b.external_id.clone()).collect(),
            books,
            skipped: 0,
            ignored: 0,
        }
    }

    async fn import(
        service: &ImportLibraryService,
        owner: UserId,
        book: ImportedBook,
    ) -> ImportSummary {
        service.execute(owner, input(vec![book])).await.unwrap()
    }

    #[tokio::test]
    async fn reimport_without_changes_writes_nothing() {
        let repo = Arc::new(InMemoryBookRepository::default());
        let service = ImportLibraryService::new(repo.clone());
        let owner = UserId::new();

        let first = import(&service, owner, imported(true, 5)).await;
        assert_eq!((first.created, first.updated, first.unchanged), (1, 0, 0));

        let second = import(&service, owner, imported(true, 5)).await;
        assert_eq!(
            (second.created, second.updated, second.unchanged),
            (0, 0, 1)
        );
    }

    #[tokio::test]
    async fn reimport_with_a_changed_field_updates_the_book() {
        let repo = Arc::new(InMemoryBookRepository::default());
        let service = ImportLibraryService::new(repo.clone());
        let owner = UserId::new();
        import(&service, owner, imported(true, 5)).await;

        let second = import(&service, owner, imported(false, 3)).await;
        assert_eq!(
            (second.created, second.updated, second.unchanged),
            (0, 1, 0)
        );

        let book = repo
            .find_by_external_id(owner, Source::Goodreads, "1")
            .await
            .unwrap()
            .unwrap();
        assert_eq!((book.rating, book.owned), (Some(3), false));
    }

    #[tokio::test]
    async fn deletes_only_the_owners_books_from_the_same_source_missing_from_the_file() {
        let repo = Arc::new(InMemoryBookRepository::default());
        let service = ImportLibraryService::new(repo.clone());
        let (ada, grace) = (UserId::new(), UserId::new());
        import(&service, ada, imported(true, 5)).await;
        import(&service, grace, imported(true, 5)).await;
        let hardcover = Book {
            source: Source::Hardcover,
            ..to_book(BookId::new(), ada, Source::Goodreads, imported(true, 5))
        };
        repo.insert(&hardcover).await.unwrap();

        let summary = service.execute(ada, input(vec![])).await.unwrap();

        assert_eq!(summary.deleted, 1);
        let left = |owner| {
            let repo = repo.clone();
            async move { repo.search(&BookFilter::all(owner)).await.unwrap() }
        };
        assert_eq!(left(ada).await, vec![hardcover]);
        assert_eq!(left(grace).await.len(), 1);
    }
}
