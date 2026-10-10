//! The export files we can read. Each format lists the columns it needs; a file is accepted
//! only when its header row matches exactly one format, so nothing is written for a file we
//! might misread.

mod goodreads;
mod hardcover;

use std::collections::HashSet;

use csv::StringRecord;
use serde::{Serialize, de::DeserializeOwned};

use super::service::{ImportLibraryInput, ImportedBook};
use crate::{books::model::Source, error::AppError};

/// What happens to one row of the file.
enum Row {
    Import(ImportedBook),
    /// Not read or being read (to-read, abandoned, custom shelves): left out on purpose.
    Ignore,
    /// Unusable, e.g. no title. The id, when known, keeps the stored book from being deleted.
    Skip {
        external_id: Option<String>,
        reason: &'static str,
    },
}

/// One format's row, as serde reads it from the CSV.
trait FormatRow: DeserializeOwned {
    fn into_row(self) -> Row;
}

/// A row that couldn't be imported, so the user can fix it.
#[derive(Debug, Serialize)]
pub struct SkippedRow {
    /// Line in the file, counting the header as line 1.
    pub line: u64,
    pub reason: String,
}

/// The whole file, parsed and validated; nothing has been written yet.
pub struct ParsedFile {
    pub source: Source,
    pub books: Vec<ImportedBook>,
    pub ignored: u32,
    pub skipped: Vec<SkippedRow>,
    ids_in_file: HashSet<String>,
}

impl ParsedFile {
    pub fn into_input(self) -> ImportLibraryInput {
        ImportLibraryInput {
            source: self.source,
            books: self.books,
            skipped: u32::try_from(self.skipped.len()).unwrap_or(u32::MAX),
            ignored: self.ignored,
            ids_in_file: self.ids_in_file,
        }
    }
}

/// Columns each format must have, in the order they're reported.
const FORMATS: [(Source, &[&str]); 2] = [
    (Source::Goodreads, &goodreads::HEADERS),
    (Source::Hardcover, &hardcover::HEADERS),
];

/// Detects the format from the header row, then parses every row.
/// Bad rows are skipped and reported, not fatal; an unknown file is a 400.
pub fn parse(csv: &str) -> Result<ParsedFile, AppError> {
    // Some spreadsheet apps save a byte-order mark before the first header.
    let csv = csv.strip_prefix('\u{feff}').unwrap_or(csv);
    let mut reader = csv::Reader::from_reader(csv.as_bytes());
    let headers = reader
        .headers()
        .map_err(|_| AppError::BadRequest("file is not a CSV file".into()))?
        .clone();

    match detect(&headers)? {
        Source::Goodreads => parse_rows::<goodreads::GoodreadsRow>(Source::Goodreads, reader),
        Source::Hardcover => parse_rows::<hardcover::HardcoverRow>(Source::Hardcover, reader),
    }
}

/// The one format whose columns are all in `headers`.
fn detect(headers: &StringRecord) -> Result<Source, AppError> {
    let missing = |columns: &[&str]| -> Vec<String> {
        columns
            .iter()
            .filter(|column| !headers.iter().any(|header| header.trim() == **column))
            .map(|column| format!("`{column}`"))
            .collect()
    };
    let mut matches = FORMATS
        .iter()
        .filter(|(_, columns)| missing(columns).is_empty());
    match (matches.next(), matches.next()) {
        (Some((source, _)), None) => Ok(*source),
        (Some(_), Some(_)) => Err(AppError::BadRequest(
            "the file has the columns of more than one export format".into(),
        )),
        (None, _) => {
            let details: Vec<String> = FORMATS
                .iter()
                .map(|(source, columns)| {
                    format!(
                        "{} is missing {}",
                        name(*source),
                        missing(columns).join(", ")
                    )
                })
                .collect();
            Err(AppError::BadRequest(format!(
                "not a Goodreads or Hardcover export: {}",
                details.join("; ")
            )))
        }
    }
}

fn name(source: Source) -> &'static str {
    match source {
        Source::Goodreads => "Goodreads",
        Source::Hardcover => "Hardcover",
    }
}

fn parse_rows<R: FormatRow>(
    source: Source,
    mut reader: csv::Reader<&[u8]>,
) -> Result<ParsedFile, AppError> {
    let headers = reader
        .headers()
        .map_err(|_| AppError::BadRequest("file is not a CSV file".into()))?
        .clone();
    let mut file = ParsedFile {
        source,
        books: Vec::new(),
        ignored: 0,
        skipped: Vec::new(),
        ids_in_file: HashSet::new(),
    };
    for record in reader.records() {
        let (line, row) = match record {
            Ok(record) => (
                record.position().map_or(0, csv::Position::line),
                record.deserialize::<R>(Some(&headers)).map(R::into_row),
            ),
            Err(e) => (e.position().map_or(0, csv::Position::line), Err(e)),
        };
        match row {
            Ok(Row::Import(book)) => {
                file.ids_in_file.insert(book.external_id.clone());
                file.books.push(book);
            }
            Ok(Row::Ignore) => file.ignored += 1,
            Ok(Row::Skip {
                external_id,
                reason,
            }) => {
                file.ids_in_file.extend(external_id);
                file.skipped.push(SkippedRow {
                    line,
                    reason: reason.into(),
                });
            }
            Err(e) => file.skipped.push(SkippedRow {
                line,
                reason: e.to_string(),
            }),
        }
    }
    Ok(file)
}

/// Trimmed text, `None` when empty.
fn non_empty(value: &str) -> Option<&str> {
    Some(value.trim()).filter(|v| !v.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    const GOODREADS: &str = include_str!("../../../../tests/fixtures/goodreads.csv");
    const HARDCOVER: &str = include_str!("../../../../tests/fixtures/hardcover.csv");

    #[test]
    fn detects_goodreads() {
        assert_eq!(parse(GOODREADS).unwrap().source, Source::Goodreads);
    }

    #[test]
    fn detects_hardcover() {
        assert_eq!(parse(HARDCOVER).unwrap().source, Source::Hardcover);
    }

    #[test]
    fn detects_a_file_saved_with_a_byte_order_mark() {
        let csv = format!("\u{feff}{HARDCOVER}");
        assert_eq!(parse(&csv).unwrap().source, Source::Hardcover);
    }

    #[test]
    fn unknown_csv_lists_the_missing_columns_of_each_format() {
        let Err(AppError::BadRequest(message)) = parse("Title,Author\nDune,Frank Herbert\n") else {
            panic!("expected a 400");
        };
        assert!(message.starts_with(
            "not a Goodreads or Hardcover export: Goodreads is missing `Book Id`, `ISBN13`"
        ));
        assert!(message.contains("; Hardcover is missing `Status`, `Hardcover Book ID`"));
        assert!(!message.contains("`Title`"));
    }

    #[test]
    fn text_that_is_not_a_csv_is_rejected() {
        assert!(matches!(
            parse("just some notes\n"),
            Err(AppError::BadRequest(_))
        ));
    }

    #[test]
    fn rows_with_the_wrong_number_of_cells_are_skipped_with_their_line() {
        let header = GOODREADS.lines().next().unwrap();
        let csv = format!("{header}\n1,Dune\n");

        let file = parse(&csv).unwrap();

        assert_eq!(file.skipped.len(), 1);
        assert_eq!(file.skipped[0].line, 2);
    }
}
