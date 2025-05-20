# Change Log

All notable changes to the "dead-code-finder" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.3] - 2025-05-20

### Added
- Support for multiple methods to detect and run Vulture:
  - Traditional pip module approach (existing method)
  - Direct binary detection in PATH
  - Support for uvx (for uv package manager users)
  - Custom binary path configuration
- New configuration option: `deadCodeFinder.vulturePath` for specifying a custom path to the Vulture executable
- Improved UI for configuring Vulture detection and installation
- Updated documentation with new installation and configuration options

### Fixed
- Extension now works with Vulture installed via uv package manager
- More robust detection of Vulture installation across different environments

## [0.0.2]

- Initial release