# Dead Code Finder for VSCode

A Visual Studio Code extension that helps you identify and remove dead code (unused methods/functions) in your Python projects.

## Features

- Detects unused methods and functions in Python code
- Displays results in a dedicated sidebar view
- Allows navigation to dead code locations
- Configurable analysis settings
- Provides confidence levels for detected dead code
- Supports whitelisting for intentional unused code

## Requirements

- Visual Studio Code v1.60.0 or higher
- Python 3.6 or higher installed
- Vulture (installed automatically if missing)

## Extension Settings

This extension contributes the following settings:

* `deadCodeFinder.enableAutoAnalysis`: Enable/disable automatic analysis on file save
* `deadCodeFinder.minConfidence`: Minimum confidence threshold (0-100) for reporting dead code
* `deadCodeFinder.excludePatterns`: Array of glob patterns to exclude from analysis
* `deadCodeFinder.includePythonLibs`: Include Python library code in analysis (not recommended)
* `deadCodeFinder.whitelistFile`: Path to whitelist file for intentional dead code

## Usage

1. Open a Python project in VSCode
2. Run the "Find Dead Code" command from the command palette
3. View results in the Dead Code Finder sidebar
4. Click on results to navigate to the dead code
5. Review and remove dead code as needed

## Known Issues

- Analysis may report false positives in dynamically accessed code
- Large projects may take time to analyze on first run

## Roadmap

- [ ] Support for multiple Python environments
- [ ] Integration with other Python linting tools
- [ ] Automatic dead code removal
- [ ] Support for additional languages (Rust, TypeScript)
- [ ] Enhanced visualization and reporting

## Development

This project is in active development. See the [implementation plan](implementation-plan.md) for details on the current status and roadmap.

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/dead-code-hunter-python.git
cd dead-code-hunter-python

# Install dependencies
npm install

# Build the extension
npm run compile

# Package the extension
npm run package
```

## License

MIT

## Credits

- [Vulture](https://github.com/jendrikseipp/vulture) - The Python dead code detection tool used by this extension 