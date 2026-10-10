use rmcp::{
    ServerHandler,
    handler::server::wrapper::Parameters,
    model::{Implementation, PromptMessage, Role, ServerCapabilities, ServerConfig},
    prompt, prompt_handler, prompt_router, tool, tool_handler, tool_router,
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{
    books::{
        get_book::GetBookService,
        library_stats::LibraryStatsService,
        model::BookId,
        search_books::{SearchBooksRequest, SearchBooksService},
    },
    error::AppError,
    state::AppState,
    users::model::UserId,
};

/// The MCP server for one library. Each tool is an adapter like an HTTP handler:
/// parse the input, `validate` it, call exactly one service, return the result as JSON text.
/// Read-only on purpose: it is public, and changes only come from the owner's imports.
#[derive(Clone)]
pub struct LibraryMcp {
    state: AppState,
    /// Whose library this server reads.
    owner: UserId,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct BookIdParams {
    /// The book's id, as returned by `search_books`.
    id: BookId,
}

/// Ok -> JSON text for the agent. Err -> a tool error whose message the agent can read and react to.
fn reply<T: Serialize>(result: Result<T, AppError>) -> Result<String, String> {
    let value = result.map_err(|err| err.to_string())?;
    serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
}

#[tool_router]
impl LibraryMcp {
    #[must_use]
    pub fn new(state: AppState, owner: UserId) -> Self {
        Self { state, owner }
    }

    #[tool(
        description = "Search this library. All filters are optional and combined; with none, lists every book. Returns `books` and their `total` count.",
        annotations(read_only_hint = true)
    )]
    async fn search_books(
        &self,
        Parameters(params): Parameters<SearchBooksRequest>,
    ) -> Result<String, String> {
        let filter = params.validate(self.owner);
        reply(
            SearchBooksService::new(self.state.books.clone())
                .execute(&filter)
                .await,
        )
    }

    #[tool(
        description = "Get one book by id.",
        annotations(read_only_hint = true)
    )]
    async fn get_book(
        &self,
        Parameters(params): Parameters<BookIdParams>,
    ) -> Result<String, String> {
        reply(
            GetBookService::new(self.state.books.clone())
                .execute(self.owner, params.id)
                .await,
        )
    }

    #[tool(
        description = "Library totals: books read and being read, owned, five-star books, and books read per year.",
        annotations(read_only_hint = true)
    )]
    async fn library_stats(&self) -> Result<String, String> {
        reply(
            LibraryStatsService::new(self.state.books.clone())
                .execute(self.owner)
                .await,
        )
    }
}

/// Ready-made questions people can pick from their client's menu.
/// A prompt only returns text for the agent; the agent then answers it with the tools above.
#[prompt_router]
impl LibraryMcp {
    #[prompt(description = "Great books in this library that most people have never heard of.")]
    async fn hidden_gems(&self) -> Vec<PromptMessage> {
        vec![PromptMessage::new_text(
            Role::User,
            "What are the best books in this library that I'm unlikely to have heard of? \
             Use search_books with status `read` and keep the 5-star books. Leave out famous titles \
             and authors. Pick about 10, group them by theme, and give one line on why each is worth \
             reading.",
        )]
    }

    #[prompt(description = "Ideas that could change how I think about the world.")]
    async fn world_changing_ideas(&self) -> Vec<PromptMessage> {
        vec![PromptMessage::new_text(
            Role::User,
            "Explore this library and find 10 ideas that I probably haven't encountered before but that \
             could significantly change how I think about the world. Use search_books with no filters to \
             see every book. For each idea, identify the best book that develops it, explain the idea in a \
             few paragraphs, give the strongest argument against it, and suggest one other book in the \
             library that provides a contrasting perspective.",
        )]
    }

    #[prompt(description = "What are the most interesting ideas represented across this library?")]
    async fn interesting_ideas(&self) -> Vec<PromptMessage> {
        vec![PromptMessage::new_text(
            Role::User,
            "What are the most interesting ideas represented across this library? Use search_books with \
             no filters to see every book. Pick about 10 ideas that show up in more than one book, and for \
             each, explain it in a short paragraph and name the books in the library that develop it. \
             Point out where books disagree with each other.",
        )]
    }

    #[prompt(
        description = "Pick one interesting idea from this library and get a path of 5 books to explore it deeply."
    )]
    async fn reading_path(&self) -> Vec<PromptMessage> {
        vec![PromptMessage::new_text(
            Role::User,
            "Pick one interesting idea from this library and give me a path of 5 books to explore it \
             deeply. Use search_books with no filters to see every book, prefer books rated 4 or 5 stars, \
             and order them so each one builds on the last. For each, say in one or two sentences what it \
             adds to the idea.",
        )]
    }

    #[prompt(
        description = "Recommend books that are substantially different from what I normally read but likely to interest me."
    )]
    async fn outside_comfort_zone(&self) -> Vec<PromptMessage> {
        vec![PromptMessage::new_text(
            Role::User,
            "This library is someone's reading history. Recommend books that are substantially different \
             from what they normally read but likely to interest them. Use search_books with status `read` \
             to learn which genres, authors and topics they usually pick and which ones got 5 stars. Then \
             suggest 5 books, not already in the library, in a genre or field they rarely read. For each, \
             say in one sentence what it has in common with books they loved and what makes it different.",
        )]
    }
}

#[tool_handler]
#[prompt_handler]
impl ServerHandler for LibraryMcp {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(
            ServerCapabilities::builder()
                .enable_tools()
                .enable_prompts()
                .build(),
        )
        .with_server_info(Implementation::new(
            "home-libraries",
            env!("CARGO_PKG_VERSION"),
        ))
        .with_instructions(
            "One person's reading history from Goodreads or Hardcover: the books they have read and are \
             reading, with their ratings and when they finished them. Read-only. `owned` means they own a \
             copy. Use search_books to find ids before get_book.",
        )
    }
}

#[cfg(test)]
mod tests {
    use serde_json::{Value, json};

    use super::*;
    use crate::books::model::{Book, ReadingStatus, Source};

    fn params<T: serde::de::DeserializeOwned>(value: Value) -> Parameters<T> {
        Parameters(serde_json::from_value(value).unwrap())
    }

    fn dune(owner: UserId) -> Book {
        Book {
            id: BookId::new(),
            user_id: owner,
            title: "Dune".into(),
            author: "Frank Herbert".into(),
            isbn13: None,
            pages: None,
            year_published: None,
            owned: true,
            status: ReadingStatus::Read,
            rating: Some(5),
            date_read: None,
            source: Source::Goodreads,
            external_id: "1".into(),
        }
    }

    /// The MCP server can't add books, so tests store them through the repository.
    async fn mcp_with_dune() -> (LibraryMcp, BookId) {
        let state = AppState::in_memory();
        let owner = UserId::new();
        let book = dune(owner);
        state.books.insert(&book).await.unwrap();
        (LibraryMcp::new(state, owner), book.id)
    }

    #[tokio::test]
    async fn search_get_and_stats() {
        let (mcp, id) = mcp_with_dune().await;

        let found = mcp
            .search_books(params(json!({ "status": "read" })))
            .await
            .unwrap();
        assert!(found.contains("Dune"));

        let book = mcp.get_book(params(json!({ "id": id }))).await.unwrap();
        assert!(book.contains("\"rating\": 5"));

        let stats = mcp.library_stats().await.unwrap();
        assert!(stats.contains("\"total\": 1"));
    }

    #[tokio::test]
    async fn only_sees_its_own_library() {
        let (mcp, _) = mcp_with_dune().await;
        let other = LibraryMcp::new(mcp.state.clone(), UserId::new());

        let found = other.search_books(params(json!({}))).await.unwrap();
        assert!(found.contains("\"total\": 0"));
    }

    #[tokio::test]
    async fn errors_are_readable_messages() {
        let (mcp, _) = mcp_with_dune().await;

        let err = mcp
            .get_book(params(json!({ "id": BookId::new() })))
            .await
            .unwrap_err();
        assert_eq!(err, "resource not found");
    }

    #[test]
    fn only_read_tools_are_exposed() {
        let mut names: Vec<_> = LibraryMcp::tool_router()
            .list_all()
            .into_iter()
            .map(|tool| tool.name.to_string())
            .collect();
        names.sort();
        assert_eq!(names, ["get_book", "library_stats", "search_books"]);
    }

    #[tokio::test]
    async fn prompts_point_the_agent_to_the_tools() {
        let mut names: Vec<_> = LibraryMcp::prompt_router()
            .list_all()
            .into_iter()
            .map(|prompt| prompt.name.clone())
            .collect();
        names.sort();
        assert_eq!(
            names,
            [
                "hidden_gems",
                "interesting_ideas",
                "outside_comfort_zone",
                "reading_path",
                "world_changing_ideas",
            ]
        );

        let (mcp, _) = mcp_with_dune().await;
        for messages in [
            mcp.hidden_gems().await,
            mcp.world_changing_ideas().await,
            mcp.interesting_ideas().await,
            mcp.reading_path().await,
            mcp.outside_comfort_zone().await,
        ] {
            let text = serde_json::to_string(&messages).unwrap();
            assert!(text.contains("search_books"));
        }
    }
}
