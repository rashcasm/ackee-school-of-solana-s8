
# Ackee School of Solana S8 tasks

This repository is a learning/workshop monorepo containing several Solana/Anchor example projects, Rust exercises, and frontends used for the School of Solana course. It is organized into multiple independent project folders

Summary of top-level folders
- **`program-rashcasm/`**: Collection of Anchor-based example programs and frontends. Contains multiple example dapps and an Anchor workspace
- **`task1-rashcasm/`**, **`task2-rashcasm/`**, **`task3-rashcasm/`**, **`task4-rashcasm/`**: Individual Rust/Anchor tasks used during exercises. Each has its own `Cargo.toml` and `src/` implementation and can be built/tested independently.

Prerequisites
- Rust toolchain (stable) and `cargo`.
- Anchor CLI (for Anchor projects): `npm i -g @project-serum/anchor-cli` or install via `cargo install --locked anchor-cli` depending on your environment.
- Solana CLI (for local validator and deployments): `solana`.
- Node.js (LTS) and `npm` or `yarn` for frontends and tests.


Notes & tips
- Each example project may contain its own README and project-specific instructions — check `program-rashcasm/*/README.md` and `task*-rashcasm/README.md` for details.
- Many Anchor projects include a `.anchor/` test ledger and keys; keep these private and avoid committing sensitive keypairs to public repositories.
- If you run into build/toolchain errors, ensure the `rust-toolchain.toml` in each project is respected (use `rustup`), and that `Anchor.toml` points to the correct cluster/IDL paths.


