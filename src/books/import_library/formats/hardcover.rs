//! Hardcover: "Settings" → "Export" (CSV).

use chrono::NaiveDate;
use serde::Deserialize;

use super::{FormatRow, ImportedBook, Row, non_empty};
use crate::books::model::ReadingStatus;

/// Columns we read. The file has more; the csv reader ignores the ones not listed here.
pub const HEADERS: [&str; 10] = [
    "Title",
    "Author",
    "Status",
    "Hardcover Book ID",
    "ISBN 13",
    "Pages",
    "Publish Date",
    "Date Finished",
    "Rating",
    "Owned",
];

/// One CSV row. Everything stays as text because Hardcover leaves many cells empty.
#[derive(Debug, Deserialize)]
pub struct HardcoverRow {
    #[serde(rename = "Title")]
    title: String,
    #[serde(rename = "Author")]
    author: String,
    #[serde(rename = "Status")]
    status: String,
    /// The work, not the edition, so switching editions keeps the same book.
    #[serde(rename = "Hardcover Book ID")]
    book_id: String,
    #[serde(rename = "ISBN 13")]
    isbn13: String,
    #[serde(rename = "Pages")]
    pages: String,
    /// The edition's date, `2006-01-01`.
    #[serde(rename = "Publish Date")]
    publish_date: String,
    #[serde(rename = "Date Finished")]
    date_finished: String,
    /// Half stars allowed: `4.5`.
    #[serde(rename = "Rating")]
    rating: String,
    #[serde(rename = "Owned")]
    owned: String,
}

impl FormatRow for HardcoverRow {
    fn into_row(self) -> Row {
        let status = match self.status.trim() {
            "Read" => ReadingStatus::Read,
            "Currently Reading" => ReadingStatus::Reading,
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
                reason: "needs a Hardcover Book ID, a Title and an Author",
            };
        };
        let isbn13 = self.isbn13.trim();
        Row::Import(ImportedBook {
            external_id: id,
            title: title.to_owned(),
            author: author.to_owned(),
            isbn13: (isbn13.len() == 13).then(|| isbn13.to_owned()),
            pages: self.pages.trim().parse().ok(),
            year_published: self
                .publish_date
                .trim()
                .get(..4)
                .and_then(|year| year.parse().ok()),
            owned: self.owned.trim() == "true",
            status,
            rating: whole_stars(&self.rating),
            date_read: NaiveDate::parse_from_str(self.date_finished.trim(), "%Y-%m-%d").ok(),
        })
    }
}

/// Libraries store whole stars, so half stars round up: 4.5 → 5. Empty means "not rated".
fn whole_stars(rating: &str) -> Option<u8> {
    let stars: f32 = rating.trim().parse().ok()?;
    (0.5..=5.0).contains(&stars).then(|| {
        // In range, so the cast can't truncate or lose the sign.
        #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
        let whole = stars.round() as u8;
        whole
    })
}

#[cfg(test)]
mod tests {
    use super::{super::parse, whole_stars};
    use crate::books::model::ReadingStatus;

    const FIXTURE: &str = include_str!("../../../../tests/fixtures/hardcover.csv");

    #[test]
    fn imports_read_and_currently_reading_books() {
        let file = parse(FIXTURE).unwrap();

        assert_eq!(
            (file.books.len(), file.ignored, file.skipped.len()),
            (5, 0, 0)
        );
        let winter_king = file
            .books
            .iter()
            .find(|b| b.title == "The Winter King")
            .unwrap();
        assert_eq!(winter_king.external_id, "185390");
        assert_eq!(winter_king.author, "Bernard Cornwell");
        assert_eq!(winter_king.isbn13.as_deref(), Some("9780140231861"));
        assert_eq!(
            (winter_king.pages, winter_king.year_published),
            (Some(448), Some(1994))
        );
        assert_eq!(winter_king.date_read.unwrap().to_string(), "2024-08-26");
        assert_eq!(winter_king.status, ReadingStatus::Read);
        assert!(winter_king.owned);
        assert_eq!(winter_king.rating, None);

        let reading = file.books.iter().find(|b| b.external_id == "8115").unwrap();
        assert_eq!(reading.status, ReadingStatus::Reading);
        assert_eq!(reading.date_read, None);
        assert!(!reading.owned);
    }

    #[test]
    fn other_statuses_are_ignored() {
        let header = FIXTURE.lines().next().unwrap();
        let row = FIXTURE.lines().nth(2).unwrap();
        let csv = format!(
            "{header}\n{}\n{}\n",
            row.replace(",Read,", ",Want to Read,"),
            row.replace(",Read,", ",Did Not Finish,")
        );

        let file = parse(&csv).unwrap();

        assert!(file.books.is_empty());
        assert_eq!(file.ignored, 2);
    }

    #[test]
    fn half_stars_round_up() {
        assert_eq!(whole_stars("5.0"), Some(5));
        assert_eq!(whole_stars("4.5"), Some(5));
        assert_eq!(whole_stars("0.5"), Some(1));
        assert_eq!(whole_stars(""), None);
        assert_eq!(whole_stars("0"), None);
    }
}
