//! Goodreads: "My Books" → "Import and export" → "Export Library".

use chrono::NaiveDate;
use serde::Deserialize;

use super::{FormatRow, ImportedBook, Row, non_empty};
use crate::books::model::ReadingStatus;

/// Columns we read. The file has more; the csv reader ignores the ones not listed here.
pub const HEADERS: [&str; 10] = [
    "Book Id",
    "Title",
    "Author",
    "ISBN13",
    "My Rating",
    "Number of Pages",
    "Original Publication Year",
    "Date Read",
    "Exclusive Shelf",
    "Owned Copies",
];

/// One CSV row. Everything stays as text because Goodreads leaves many cells empty.
#[derive(Debug, Deserialize)]
pub struct GoodreadsRow {
    #[serde(rename = "Book Id")]
    book_id: String,
    #[serde(rename = "Title")]
    title: String,
    #[serde(rename = "Author")]
    author: String,
    #[serde(rename = "ISBN13")]
    isbn13: String,
    #[serde(rename = "My Rating")]
    rating: String,
    #[serde(rename = "Number of Pages")]
    pages: String,
    #[serde(rename = "Original Publication Year")]
    year: String,
    #[serde(rename = "Date Read")]
    date_read: String,
    #[serde(rename = "Exclusive Shelf")]
    shelf: String,
    #[serde(rename = "Owned Copies")]
    owned_copies: String,
}

impl FormatRow for GoodreadsRow {
    fn into_row(self) -> Row {
        let status = match self.shelf.trim() {
            "read" => ReadingStatus::Read,
            "currently-reading" => ReadingStatus::Reading,
            _ => return Row::Ignore,
        };
        let external_id = non_empty(&self.book_id).map(str::to_owned);
        let (Some(id), Some(title), Some(author)) = (
            external_id.clone(),
            non_empty(&self.title),
            non_empty(&self.author),
        ) else {
            return Row::Skip {
                external_id,
                reason: "needs a Book Id, a Title and an Author",
            };
        };
        // Goodreads writes ISBNs as `="9780441172719"` so spreadsheets keep the digits.
        let isbn13 = self.isbn13.trim_matches(|c| c == '=' || c == '"').trim();
        Row::Import(ImportedBook {
            external_id: id,
            title: title.to_owned(),
            author: author.to_owned(),
            isbn13: (isbn13.len() == 13).then(|| isbn13.to_owned()),
            pages: self.pages.trim().parse().ok(),
            year_published: self.year.trim().parse().ok(),
            owned: self.owned_copies.trim().parse::<u32>().is_ok_and(|n| n > 0),
            status,
            // Goodreads writes whole-star ratings like "5.0"; 0 stars means "not rated".
            rating: self
                .rating
                .trim()
                .trim_end_matches(".0")
                .parse::<u8>()
                .ok()
                .filter(|r| (1..=5).contains(r)),
            date_read: NaiveDate::parse_from_str(self.date_read.trim(), "%Y/%m/%d").ok(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::super::parse;

    const HEADER: &str = "Book Id,Title,Author,ISBN13,My Rating,Number of Pages,Original Publication Year,Date Read,Exclusive Shelf,Owned Copies";

    #[test]
    fn parses_every_field() {
        let csv = format!(
            "{HEADER}\n1,Dune,Frank Herbert,\"=\"\"9780441172719\"\"\",5.0,412,1965,2026/09/25,read,1\n"
        );

        let file = parse(&csv).unwrap();

        assert!(file.skipped.is_empty());
        let dune = &file.books[0];
        assert_eq!(dune.external_id, "1");
        assert_eq!(dune.isbn13.as_deref(), Some("9780441172719"));
        assert_eq!(
            (dune.rating, dune.pages, dune.year_published),
            (Some(5), Some(412), Some(1965))
        );
        assert_eq!(dune.date_read.unwrap().to_string(), "2026-09-25");
        assert!(dune.owned);
    }

    #[test]
    fn zero_rating_means_not_rated() {
        let csv = format!("{HEADER}\n1,Dune,Frank Herbert,,0.0,,,,read,0\n");

        let file = parse(&csv).unwrap();

        assert_eq!(file.books[0].rating, None);
    }

    #[test]
    fn skipped_rows_still_count_as_in_the_file() {
        let csv = format!("{HEADER}\n1,,Frank Herbert,,0,,,,read,0\n");

        let file = parse(&csv).unwrap();

        assert_eq!(file.skipped[0].line, 2);
        assert!(file.into_input().ids_in_file.contains("1"));
    }

    #[test]
    fn only_read_and_reading_shelves_are_imported() {
        let csv = format!(
            "{HEADER}\n\
             1,Dune,Frank Herbert,,5,,,,read,0\n\
             2,Neuromancer,William Gibson,,0,,,,currently-reading,0\n\
             3,Animal Farm,George Orwell,,0,,,,to-read,1\n\
             4,Emma,Jane Austen,,0,,,,abandoned,0\n"
        );

        let file = parse(&csv).unwrap();

        let titles: Vec<_> = file.books.iter().map(|b| b.title.as_str()).collect();
        assert_eq!(titles, ["Dune", "Neuromancer"]);
        assert_eq!((file.ignored, file.skipped.len()), (2, 0));
        // Ignored rows are not "in the file", so a to-read book would be deleted.
        assert!(!file.into_input().ids_in_file.contains("3"));
    }
}
