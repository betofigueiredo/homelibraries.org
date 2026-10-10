//! `web.rs` embeds `web/dist`, which only exists after `npm run build`.
//! An empty folder lets `cargo build`, `test` and `clippy` work without Node;
//! the app then answers pages with an error that says to build the frontend.

fn main() {
    std::fs::create_dir_all("web/dist").expect("cannot create web/dist");
    // Re-embed when the frontend is rebuilt (Vite replaces the folder's files).
    println!("cargo:rerun-if-changed=web/dist");
    println!("cargo:rerun-if-changed=build.rs");
}
