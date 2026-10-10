mod common;

use axum::{
    body::Body,
    http::{Method, Request, StatusCode, header},
};
use common::TestApp;
use serde_json::{Value, json};

/// Ada signs up as `ada` and imports the fixture; returns her session cookie.
async fn ada_with_fixture(app: &TestApp) -> String {
    let cookie = app.sign_up("ada@mail.com", "ada").await;
    let (status, _) = app.import(common::FIXTURE, Some(&cookie)).await;
    assert_eq!(status, StatusCode::OK);
    cookie
}

async fn titles(app: &TestApp, uri: &str) -> Vec<String> {
    let (status, found) = app.get(uri).await;
    assert_eq!(status, StatusCode::OK, "{uri}");
    found["books"]
        .as_array()
        .unwrap()
        .iter()
        .map(|b| b["title"].as_str().unwrap().to_owned())
        .collect()
}

#[tokio::test]
async fn get_imported_book() {
    let app = common::app();
    ada_with_fixture(&app).await;

    let (_, found) = app.get("/api/libraries/ada/books?q=dune").await;
    let book = &found["books"][0];
    let id = book["id"].as_str().unwrap();

    let (status, fetched) = app.get(&format!("/api/libraries/ada/books/{id}")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(&fetched, book);
    assert_eq!(fetched["source"], "goodreads");
}

#[tokio::test]
async fn libraries_are_separate() {
    let app = common::app();
    ada_with_fixture(&app).await;
    app.sign_up("grace@mail.com", "grace").await;

    let (_, found) = app.get("/api/libraries/ada/books?q=dune").await;
    let id = found["books"][0]["id"].as_str().unwrap();

    let (status, _) = app.get(&format!("/api/libraries/grace/books/{id}")).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert!(titles(&app, "/api/libraries/grace/books").await.is_empty());
}

#[tokio::test]
async fn unknown_library_or_book_is_not_found() {
    let app = common::app();
    app.sign_up("ada@mail.com", "ada").await;
    let id = uuid::Uuid::new_v4();

    for uri in [
        "/api/libraries/nobody".to_owned(),
        "/api/libraries/nobody/books".to_owned(),
        "/api/libraries/nobody/stats".to_owned(),
        format!("/api/libraries/ada/books/{id}"),
    ] {
        let (status, _) = app.get(&uri).await;
        assert_eq!(status, StatusCode::NOT_FOUND, "{uri}");
    }
}

#[tokio::test]
async fn library_profile_is_public_but_not_the_email() {
    let app = common::app();
    let cookie = app.sign_up("ada@mail.com", "ada").await;
    app.send(
        Method::PATCH,
        "/api/me",
        Some(json!({ "display_name": "Ada Lovelace" })),
        Some(&cookie),
    )
    .await;

    // Usernames are case-insensitive in URLs.
    let (status, profile) = app.get("/api/libraries/Ada").await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        profile,
        json!({ "username": "ada", "display_name": "Ada Lovelace" })
    );
}

#[tokio::test]
async fn books_cannot_be_created_or_edited_by_hand() {
    let app = common::app();
    let cookie = ada_with_fixture(&app).await;
    let id = uuid::Uuid::new_v4();

    let reply = app
        .send(
            Method::POST,
            "/api/libraries/ada/books",
            Some(json!({ "title": "Dune", "author": "Frank Herbert" })),
            Some(&cookie),
        )
        .await;
    assert_eq!(reply.status, StatusCode::METHOD_NOT_ALLOWED);

    let reply = app
        .send(
            Method::PATCH,
            &format!("/api/libraries/ada/books/{id}"),
            Some(json!({ "status": "read" })),
            Some(&cookie),
        )
        .await;
    assert_eq!(reply.status, StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn search_filters_by_text_status_and_owned() {
    let app = common::app();
    ada_with_fixture(&app).await;

    let (_, all) = app.get("/api/libraries/ada/books").await;
    assert_eq!(all["total"], 2);

    let dune = ["Dune (Dune, #1)"];
    assert_eq!(
        titles(&app, "/api/libraries/ada/books?q=herbert").await,
        dune
    );
    assert_eq!(
        titles(&app, "/api/libraries/ada/books?status=read").await,
        dune
    );
    assert_eq!(
        titles(&app, "/api/libraries/ada/books?owned=true").await,
        dune
    );
    assert_eq!(
        titles(&app, "/api/libraries/ada/books?status=reading&owned=false").await,
        ["Neuromancer"]
    );

    let (status, _) = app.get("/api/libraries/ada/books?status=to_read").await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn search_sorts_by_title_author_or_date_read() {
    let app = common::app();
    ada_with_fixture(&app).await;

    for (query, expected) in [
        ("", ["Dune (Dune, #1)", "Neuromancer"]),
        ("?sort=author", ["Dune (Dune, #1)", "Neuromancer"]),
        // Neuromancer has no date read, so it goes last.
        ("?sort=date_read", ["Dune (Dune, #1)", "Neuromancer"]),
    ] {
        let uri = format!("/api/libraries/ada/books{query}");
        assert_eq!(titles(&app, &uri).await, expected, "{uri}");
    }

    let (status, _) = app.get("/api/libraries/ada/books?sort=pages").await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn stats_count_books() {
    let app = common::app();
    ada_with_fixture(&app).await;

    let (status, body) = app.get("/api/libraries/ada/stats").await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        body,
        json!({
            "total": 2, "read": 1, "reading": 1, "owned": 1, "five_stars": 1,
            "read_per_year": { "2024": 1 }
        })
    );
}

#[tokio::test]
async fn import_is_idempotent_and_leaves_to_read_books_out() {
    let app = common::app();
    let cookie = app.sign_up("ada@mail.com", "ada").await;

    let (status, summary) = app.import(common::FIXTURE, Some(&cookie)).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        summary,
        json!({ "source": "goodreads", "created": 2, "updated": 0, "unchanged": 0, "skipped": 1, "ignored": 1, "deleted": 0 })
    );

    let (_, summary) = app.import(common::FIXTURE, Some(&cookie)).await;
    assert_eq!(
        summary,
        json!({ "source": "goodreads", "created": 0, "updated": 0, "unchanged": 2, "skipped": 1, "ignored": 1, "deleted": 0 })
    );

    let (_, books) = app.get("/api/libraries/ada/books?q=dune").await;
    let dune = &books["books"][0];
    assert_eq!(dune["isbn13"], "9780441172719");
    assert_eq!(dune["rating"], 5);
    assert_eq!(dune["date_read"], "2024-03-01");
    assert_eq!(dune["year_published"], 1965);
    assert_eq!(dune["owned"], true);

    let (_, books) = app.get("/api/libraries/ada/books?q=neuromancer").await;
    assert_eq!(books["books"][0]["status"], "reading");
    assert_eq!(books["books"][0]["isbn13"], Value::Null);
    assert_eq!(books["books"][0]["rating"], Value::Null);

    assert!(
        titles(&app, "/api/libraries/ada/books?q=animal")
            .await
            .is_empty()
    );
}

#[tokio::test]
async fn reimport_makes_the_library_match_the_file() {
    let app = common::app();
    let cookie = ada_with_fixture(&app).await;

    // Dune is no longer owned (last column) and Neuromancer was removed from Goodreads.
    let csv = common::FIXTURE
        .lines()
        .filter(|line| !line.starts_with("22328,"))
        .map(|line| {
            if line.starts_with("234225,") {
                line.replace(",1,1", ",1,0")
            } else {
                line.to_owned()
            }
        })
        .collect::<Vec<_>>()
        .join("\n");
    let (status, summary) = app.import(&csv, Some(&cookie)).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        summary,
        json!({ "source": "goodreads", "created": 0, "updated": 1, "unchanged": 0, "skipped": 1, "ignored": 1, "deleted": 1 })
    );

    let (_, books) = app.get("/api/libraries/ada/books?q=dune").await;
    assert_eq!(books["books"][0]["owned"], false);
    assert!(
        titles(&app, "/api/libraries/ada/books?q=neuromancer")
            .await
            .is_empty()
    );
}

#[tokio::test]
async fn import_needs_a_signed_in_user() {
    let app = common::app();

    let (status, body) = app.import(common::FIXTURE, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    assert_eq!(
        body["error"],
        "sign in first: the link or session is invalid or expired"
    );

    let (status, _) = app.import(common::FIXTURE, Some("session=made-up")).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn import_rejects_an_unknown_csv() {
    let app = common::app();
    let cookie = app.sign_up("ada@mail.com", "ada").await;

    let (status, body) = app
        .import("name,email\nAda,ada@mail.com\n", Some(&cookie))
        .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    let error = body["error"].as_str().unwrap();
    assert!(
        error.starts_with("bad request: not a Goodreads or Hardcover export: Goodreads is missing"),
        "{error}"
    );
    assert!(error.contains("Hardcover is missing"), "{error}");
}

#[tokio::test]
async fn preview_reports_the_file_without_writing() {
    let app = common::app();
    let cookie = app.sign_up("ada@mail.com", "ada").await;

    let (status, preview) = app.preview(common::FIXTURE, Some(&cookie)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(preview["source"], "goodreads");
    assert_eq!(
        (
            &preview["to_import"],
            &preview["ignored"],
            &preview["skipped"]
        ),
        (&json!(2), &json!(1), &json!(1))
    );
    assert_eq!(preview["sample"][0]["title"], "Dune (Dune, #1)");
    assert_eq!(preview["errors"][0]["line"], 5);
    assert!(titles(&app, "/api/libraries/ada/books").await.is_empty());

    let (status, _) = app.preview(common::FIXTURE, None).await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn imports_a_hardcover_export_next_to_goodreads_books() {
    let app = common::app();
    let cookie = ada_with_fixture(&app).await;

    let (status, summary) = app.import(common::HARDCOVER_FIXTURE, Some(&cookie)).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        summary,
        json!({ "source": "hardcover", "created": 5, "updated": 0, "unchanged": 0, "skipped": 0, "ignored": 0, "deleted": 0 })
    );

    let (_, books) = app.get("/api/libraries/ada/books?q=winter").await;
    let winter_king = &books["books"][0];
    assert_eq!(winter_king["source"], "hardcover");
    assert_eq!(winter_king["date_read"], "2024-08-26");
    assert_eq!(winter_king["owned"], true);
    // The Goodreads books stay.
    assert_eq!(titles(&app, "/api/libraries/ada/books").await.len(), 7);
}

#[tokio::test]
async fn import_needs_a_file_upload() {
    let app = common::app();
    let cookie = app.sign_up("ada@mail.com", "ada").await;

    let reply = app
        .send(
            Method::POST,
            "/api/me/import",
            Some(json!({ "path": "goodreads.csv" })),
            Some(&cookie),
        )
        .await;
    assert_eq!(reply.status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn each_library_has_its_own_mcp_server() {
    let app = common::app();
    ada_with_fixture(&app).await;
    app.sign_up("grace@mail.com", "grace").await;

    let search = |username: &str| {
        Request::post(format!("/{username}/mcp"))
            .header(header::HOST, "localhost")
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::ACCEPT, "application/json, text/event-stream")
            .body(Body::from(
                json!({
                    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
                    "params": { "name": "search_books", "arguments": { "q": "dune" } }
                })
                .to_string(),
            ))
            .unwrap()
    };

    let reply = app.read(search("ada")).await;
    assert_eq!(reply.status, StatusCode::OK);
    let text = reply.body["result"]["content"][0]["text"].as_str().unwrap();
    assert!(text.contains("Dune"), "{text}");

    let reply = app.read(search("grace")).await;
    let text = reply.body["result"]["content"][0]["text"].as_str().unwrap();
    assert!(text.contains("\"total\": 0"), "{text}");

    let reply = app.read(search("nobody")).await;
    assert_eq!(reply.status, StatusCode::NOT_FOUND);
}
