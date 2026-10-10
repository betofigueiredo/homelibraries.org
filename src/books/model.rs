use chrono::NaiveDate;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::users::model::UserId;

/// Strongly typed id so a random `Uuid` can't be passed where a book id is expected.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, JsonSchema)]
#[serde(transparent)]
pub struct BookId(pub Uuid);

impl BookId {
    #[must_use]
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl Default for BookId {
    fn default() -> Self {
        Self::new()
    }
}

/// Only books someone has read or is reading are imported; to-read lists stay out.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ReadingStatus {
    Reading,
    Read,
}

impl ReadingStatus {
    /// Stable text form, used for storage.
    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Reading => "reading",
            Self::Read => "read",
        }
    }

    #[must_use]
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "reading" => Some(Self::Reading),
            "read" => Some(Self::Read),
            _ => None,
        }
    }
}

/// The service a book was imported from.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum Source {
    Goodreads,
    Hardcover,
}

impl Source {
    /// Stable text form, used for storage.
    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Goodreads => "goodreads",
            Self::Hardcover => "hardcover",
        }
    }

    #[must_use]
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "goodreads" => Some(Self::Goodreads),
            "hardcover" => Some(Self::Hardcover),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Book {
    pub id: BookId,
    /// The library this book is in. Not shown: the URL already says whose library it is.
    #[serde(skip)]
    pub user_id: UserId,
    pub title: String,
    pub author: String,
    pub isbn13: Option<String>,
    pub pages: Option<u32>,
    pub year_published: Option<i32>,
    /// `true` when the reader owns a copy.
    pub owned: bool,
    pub status: ReadingStatus,
    /// 1 to 5 stars.
    pub rating: Option<u8>,
    pub date_read: Option<NaiveDate>,
    pub source: Source,
    /// The book's id in `source`, so re-importing updates instead of duplicating.
    #[serde(skip)]
    pub external_id: String,
}

impl Book {
    /// Case-insensitive match on title or author. `needle` must already be lowercase.
    #[must_use]
    pub fn matches_text(&self, needle: &str) -> bool {
        self.title.to_lowercase().contains(needle) || self.author.to_lowercase().contains(needle)
    }
}

/// Order of search results. Ties are broken by title.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum SortBy {
    /// A to Z.
    #[default]
    Title,
    /// A to Z.
    Author,
    /// Most recently read first; books never finished go last.
    DateRead,
}

impl SortBy {
    /// Text form passed to the `SQLite` query.
    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Title => "title",
            Self::Author => "author",
            Self::DateRead => "date_read",
        }
    }
}

/// Criteria for `BookRepository::search`, always within one library.
/// `None` means "don't filter on this".
#[derive(Debug, Clone)]
pub struct BookFilter {
    pub user_id: UserId,
    pub text: Option<String>,
    pub status: Option<ReadingStatus>,
    pub owned: Option<bool>,
    pub sort: SortBy,
}

impl BookFilter {
    /// Every book in the library, sorted by title.
    #[must_use]
    pub fn all(user_id: UserId) -> Self {
        Self {
            user_id,
            text: None,
            status: None,
            owned: None,
            sort: SortBy::Title,
        }
    }
}
