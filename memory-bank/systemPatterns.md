# System Patterns

## Overall Architecture
The extension follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│            VSCode Extension         │
├─────────────────┬───────────────────┤
│   UI Components │  Command Handlers │
├─────────────────┴───────────────────┤
│         Analyzer Interface          │
├─────────────────┬───────────────────┤
│ Python Analyzer │ Future Analyzers  │
│  (Vulture)      │ (Rust, TS, etc.)  │
└─────────────────┴───────────────────┘
```

## Core Components

### 1. Extension Entry Point
- Handles activation events
- Registers commands, views, and event listeners
- Initializes the analyzer system

### 2. UI Components
- TreeView for displaying dead code results
- Status bar integration for analysis progress
- Context menu options for navigation and actions

### 3. Analyzer Interface
- Common interface that all language analyzers implement
- Defines methods for analysis, result formatting, and navigation
- Handles analyzer registration and selection

### 4. Language Analyzers
- Python Analyzer: Integrates with Vulture
- Future analyzers for other languages
- Each analyzer handles language-specific parsing and analysis

## Data Flow
1. User triggers analysis (manually or on file save)
2. Extension determines appropriate analyzer based on language
3. Analyzer processes files and identifies dead code
4. Results are formatted into a common structure
5. UI is updated to display the results
6. User can navigate to or take actions on dead code

## Extension Points
- New language analyzers can be added by implementing the analyzer interface
- Additional views can be created for different result visualizations
- Commands can be extended for new actions on dead code

## Performance Considerations
- Analysis runs in a separate process to avoid blocking the UI
- Results are cached and only updated when relevant files change
- Large projects may use incremental analysis to improve responsiveness

## Future Expansion
- Language Server Protocol integration for rich language support
- Enhanced visualization options (e.g., code graphs)
- Multi-project support for monorepo analysis 