use async_trait::async_trait;
use chrono::NaiveDate;
use sqlx::SqlitePool;
use uuid::Uuid;

use super::BookRepository;
use crate::{
    books::model::{Book, BookFilter, BookId, ReadingStatus, Source},
    error::AppError,
    users::model::UserId,
};

/// Real persistence: one `SQLite` file on disk. The table is created by `migrations/`.
pub struct SqliteBookRepository {
    pool: SqlitePool,
}

impl SqliteBookRepository {
    #[must_use]
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

/// One row exactly as `SQLite` stores it. Converted into a `Book` with `into_book`.
#[derive(sqlx::FromRow)]
struct BookRow {
    id: String,
    user_id: String,
    source: String,
    external_id: String,
    title: String,
    author: String,
    isbn13: Option<String>,
    pages: Option<i64>,
    year_published: Option<i64>,
    owned: bool,
    status: String,
    rating: Option<i64>,
    date_read: Option<NaiveDate>,
}

impl BookRow {
    /// Fails only if the file holds data this code never writes (e.g. edited by hand).
    fn into_book(self) -> Result<Book, AppError> {
        let corrupt = |field: &str| AppError::Internal(format!("invalid {field} in books table"));
        Ok(Book {
            id: BookId(Uuid::parse_str(&self.id).map_err(|_| corrupt("id"))?),
            user_id: UserId(Uuid::parse_str(&self.user_id).map_err(|_| corrupt("user_id"))?),
            title: self.title,
            author: self.author,
            isbn13: self.isbn13,
            pages: self.pages.and_then(|p| u32::try_from(p).ok()),
            year_published: self.year_published.and_then(|y| i32::try_from(y).ok()),
            owned: self.owned,
            status: ReadingStatus::parse(&self.status).ok_or_else(|| corrupt("status"))?,
            rating: self.rating.and_then(|r| u8::try_from(r).ok()),
            date_read: self.date_read,
            source: Source::parse(&self.source).ok_or_else(|| corrupt("source"))?,
            external_id: self.external_id,
        })
    }
}

#[async_trait]
impl BookRepository for SqliteBookRepository {
    async fn get(&self, user_id: UserId, id: BookId) -> Result<Option<Book>, AppError> {
        let row: Option<BookRow> =
            sqlx::query_as("SELECT * FROM books WHERE id = ? AND user_id = ?")
                .bind(id.0.to_string())
                .bind(user_id.0.to_string())
                .fetch_optional(&self.pool)
                .await?;
        row.map(BookRow::into_book).transpose()
    }

    async fn search(&self, filter: &BookFilter) -> Result<Vec<Book>, AppError> {
        // Each `?N IS NULL OR ...` turns a filter off when its value is `None`,
        // so one static query covers every combination. LIKE ignores ASCII case.
        // Columns can't be bound, so ?5 picks the sort key with CASE; unused keys are NULL for every row.
        let rows: Vec<BookRow> = sqlx::query_as(
            "SELECT * FROM books
             WHERE user_id = ?1
               AND (?2 IS NULL OR title LIKE '%' || ?2 || '%' OR author LIKE '%' || ?2 || '%')
               AND (?3 IS NULL OR status = ?3)
               AND (?4 IS NULL OR owned = ?4)
             ORDER BY
               CASE WHEN ?5 = 'author' THEN author END,
               CASE WHEN ?5 = 'date_read' THEN date_read END DESC NULLS LAST,
               title",
        )
        .bind(filter.user_id.0.to_string())
        .bind(filter.text.as_deref())
        .bind(filter.status.map(ReadingStatus::as_str))
        .bind(filter.owned)
        .bind(filter.sort.as_str())
        .fetch_all(&self.pool)
        .await?;
        rows.into_iter().map(BookRow::into_book).collect()
    }

    async fn find_by_external_id(
        &self,
        user_id: UserId,
        source: Source,
        external_id: &str,
    ) -> Result<Option<Book>, AppError> {
        let row: Option<BookRow> = sqlx::query_as(
            "SELECT * FROM books WHERE user_id = ? AND source = ? AND external_id = ?",
        )
        .bind(user_id.0.to_string())
        .bind(source.as_str())
        .bind(external_id)
        .fetch_optional(&self.pool)
        .await?;
        row.map(BookRow::into_book).transpose()
    }

    async fn insert(&self, book: &Book) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO books (id, user_id, source, external_id, title, author, isbn13, pages,
                year_published, owned, status, rating, date_read)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(book.id.0.to_string())
        .bind(book.user_id.0.to_string())
        .bind(book.source.as_str())
        .bind(&book.external_id)
        .bind(&book.title)
        .bind(&book.author)
        .bind(&book.isbn13)
        .bind(book.pages)
        .bind(book.year_published)
        .bind(book.owned)
        .bind(book.status.as_str())
        .bind(book.rating)
        .bind(book.date_read)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// The owner, source and external id never change, so they are not updated.
    async fn update(&self, book: &Book) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE books SET title = ?, author = ?, isbn13 = ?, pages = ?, year_published = ?,
                owned = ?, status = ?, rating = ?, date_read = ?
             WHERE id = ?",
        )
        .bind(&book.title)
        .bind(&book.author)
        .bind(&book.isbn13)
        .bind(book.pages)
        .bind(book.year_published)
        .bind(book.owned)
        .bind(book.status.as_str())
        .bind(book.rating)
        .bind(book.date_read)
        .bind(book.id.0.to_string())
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn delete(&self, id: BookId) -> Result<(), AppError> {
        sqlx::query("DELETE FROM books WHERE id = ?")
            .bind(id.0.to_string())
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;

    use super::*;
    use crate::{
        books::model::SortBy,
        users::{
            model::User,
            repository::{SqliteUserRepository, UserRepository},
        },
    };

    /// A fresh in-memory `SQLite` database with the real migrations applied and two users.
    /// One connection only: every `:memory:` connection would get its own empty database.
    async fn repo() -> (SqliteBookRepository, UserId, UserId) {
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!().run(&pool).await.unwrap();
        let users = SqliteUserRepository::new(pool.clone());
        let mut ids = Vec::new();
        for email in ["ada@mail.com", "grace@mail.com"] {
            let user = User {
                id: UserId::new(),
                email: email.into(),
                username: None,
                display_name: None,
                created_at: Utc::now(),
            };
            users.insert(&user).await.unwrap();
            ids.push(user.id);
        }
        (SqliteBookRepository::new(pool), ids[0], ids[1])
    }

    fn book(user_id: UserId, title: &str, status: ReadingStatus) -> Book {
        Book {
            id: BookId::new(),
            user_id,
            title: title.into(),
            author: "Frank Herbert".into(),
            isbn13: Some("9780441172719".into()),
            pages: Some(412),
            year_published: Some(1965),
            owned: true,
            status,
            rating: Some(5),
            date_read: NaiveDate::from_ymd_opt(2024, 3, 1),
            source: Source::Goodreads,
            external_id: title.to_lowercase(),
        }
    }

    #[tokio::test]
    async fn insert_get_and_update_round_trip() {
        let (repo, ada, _) = repo().await;
        let mut dune = book(ada, "Dune", ReadingStatus::Read);
        repo.insert(&dune).await.unwrap();

        assert_eq!(repo.get(ada, dune.id).await.unwrap(), Some(dune.clone()));
        assert_eq!(
            repo.find_by_external_id(ada, Source::Goodreads, "dune")
                .await
                .unwrap(),
            Some(dune.clone())
        );
        assert_eq!(
            repo.find_by_external_id(ada, Source::Hardcover, "dune")
                .await
                .unwrap(),
            None
        );

        dune.owned = false;
        repo.update(&dune).await.unwrap();
        assert!(!repo.get(ada, dune.id).await.unwrap().unwrap().owned);

        repo.delete(dune.id).await.unwrap();
        assert_eq!(repo.get(ada, dune.id).await.unwrap(), None);
    }

    #[tokio::test]
    async fn libraries_are_separate() {
        let (repo, ada, grace) = repo().await;
        let dune = book(ada, "Dune", ReadingStatus::Read);
        repo.insert(&dune).await.unwrap();
        // The same Goodreads book can be in two libraries.
        repo.insert(&book(grace, "Dune", ReadingStatus::Reading))
            .await
            .unwrap();

        assert_eq!(repo.get(grace, dune.id).await.unwrap(), None);
        let graces = repo.search(&BookFilter::all(grace)).await.unwrap();
        assert_eq!(graces.len(), 1);
        assert_eq!(graces[0].status, ReadingStatus::Reading);
    }

    #[tokio::test]
    async fn search_applies_filters() {
        let (repo, ada, _) = repo().await;
        let mut messiah = book(ada, "Dune Messiah", ReadingStatus::Reading);
        messiah.owned = false;
        repo.insert(&book(ada, "Dune", ReadingStatus::Read))
            .await
            .unwrap();
        repo.insert(&messiah).await.unwrap();

        assert_eq!(repo.search(&BookFilter::all(ada)).await.unwrap().len(), 2);

        let filter = BookFilter {
            text: Some("messiah".into()),
            ..BookFilter::all(ada)
        };
        assert_eq!(repo.search(&filter).await.unwrap(), vec![messiah.clone()]);

        let filter = BookFilter {
            status: Some(ReadingStatus::Reading),
            owned: Some(false),
            ..BookFilter::all(ada)
        };
        assert_eq!(repo.search(&filter).await.unwrap(), vec![messiah]);
    }

    #[tokio::test]
    async fn search_sorts_by_the_chosen_field() {
        let (repo, ada, _) = repo().await;
        let books = [
            (
                "Neuromancer",
                "William Gibson",
                NaiveDate::from_ymd_opt(2023, 5, 1),
            ),
            ("Dune", "Frank Herbert", NaiveDate::from_ymd_opt(2024, 3, 1)),
            ("Hyperion", "Dan Simmons", None),
        ]
        .map(|(title, author, date_read)| Book {
            author: author.into(),
            date_read,
            ..book(ada, title, ReadingStatus::Read)
        });
        for book in &books {
            repo.insert(book).await.unwrap();
        }

        let titles = async |sort| {
            let filter = BookFilter {
                sort,
                ..BookFilter::all(ada)
            };
            let found = repo.search(&filter).await.unwrap();
            found.into_iter().map(|b| b.title).collect::<Vec<_>>()
        };
        assert_eq!(
            titles(SortBy::Title).await,
            ["Dune", "Hyperion", "Neuromancer"]
        );
        assert_eq!(
            titles(SortBy::Author).await,
            ["Hyperion", "Dune", "Neuromancer"]
        );
        assert_eq!(
            titles(SortBy::DateRead).await,
            ["Dune", "Neuromancer", "Hyperion"]
        );
    }
}
