# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3](https://github.com/felipeinf/fasterizy/releases/tag/v1.0.3) - 2026-04-19

### Fixed

- Codex: add `.agents/plugins/marketplace.json` in the canonical format so `/plugin install` can resolve the plugin; npm package includes `.agents/`.
- Docs and CLI: clarify that `npx fasterizy install --agents codex` installs hooks only, and that the plugin directory entry comes from the `/plugin marketplace add` + `/plugin install` flow; expand the post-install report for the Codex target.

## [1.0.0](https://github.com/felipeinf/fasterizy/releases/tag/v1.0.0) - 2026-04-18

### Added

- First public release: compressed prose skill, hooks for Claude Code / Codex, CLI (`install`, `update`, `start`, `stop`, `status`), plugin manifests for marketplace install, `npx skills` compatibility.

### Notes

- Pre-1.0 history: 39 internal iterations during design phase (not published to npm).